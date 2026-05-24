/** Serviço WebSocket para sincronização em tempo real com o servidor */
import { WS_URL } from '../constants';
import { SensorLog } from '../types';

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
type StateListener = (state: ConnectionState) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseDelay = 1000; // 1s inicial
  private maxDelay = 30000; // máximo 30s entre tentativas
  private _state: ConnectionState = 'disconnected';
  private stateListeners: Set<StateListener> = new Set();
  private pendingAcks: Map<string, (count: number) => void> = new Map();

  /** Estado atual da conexão */
  get state(): ConnectionState {
    return this._state;
  }

  /** Verifica se está conectado e pronto para enviar */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /** Registra listener para mudanças de estado */
  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private setState(newState: ConnectionState) {
    this._state = newState;
    this.stateListeners.forEach((fn) => fn(newState));
  }

  /** Inicia a conexão WebSocket com o servidor */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[WS] Já conectado ou conectando, ignorando.');
      return;
    }

    this.setState('connecting');
    console.log(`[WS] Conectando a ${WS_URL}...`);

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('[WS] Conexão estabelecida!');
        this.reconnectAttempts = 0;
        this.setState('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          console.log('[WS] Mensagem recebida:', data);

          // Processa ack de sincronização
          if (data.type === 'sync_ack' && data.requestId) {
            const resolver = this.pendingAcks.get(data.requestId);
            if (resolver) {
              resolver(data.count ?? 0);
              this.pendingAcks.delete(data.requestId);
            }
          }
        } catch (err) {
          console.warn('[WS] Mensagem inválida recebida:', event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Erro na conexão:', error);
      };

      this.ws.onclose = (event) => {
        console.log(`[WS] Conexão fechada (code=${event.code}, reason=${event.reason})`);
        this.ws = null;
        this.setState('disconnected');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[WS] Falha ao criar WebSocket:', error);
      this.setState('disconnected');
      this.scheduleReconnect();
    }
  }

  /** Envia logs via WebSocket. Retorna a quantidade inserida ou null se falhar. */
  async sendLogs(logs: SensorLog[]): Promise<number | null> {
    if (!this.isConnected || !this.ws) {
      console.log('[WS] Não conectado, impossível enviar via WS.');
      return null;
    }

    const requestId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return new Promise<number | null>((resolve) => {
      // Timeout de 5s para receber o ack
      const timeout = setTimeout(() => {
        this.pendingAcks.delete(requestId);
        console.warn('[WS] Timeout esperando ack do servidor.');
        resolve(null);
      }, 5000);

      this.pendingAcks.set(requestId, (count: number) => {
        clearTimeout(timeout);
        resolve(count);
      });

      try {
        this.ws!.send(
          JSON.stringify({
            type: 'sync',
            requestId,
            logs,
          })
        );
        console.log(`[WS] Enviados ${logs.length} logs (requestId=${requestId})`);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingAcks.delete(requestId);
        console.error('[WS] Erro ao enviar:', error);
        resolve(null);
      }
    });
  }

  /** Agenda reconexão com backoff exponencial */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Máximo de tentativas atingido. Desistindo da reconexão.');
      return;
    }

    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.maxDelay
    );

    console.log(`[WS] Reconectando em ${delay / 1000}s (tentativa ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
    this.setState('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /** Desconecta e limpa todos os recursos */
  disconnect(): void {
    console.log('[WS] Desconectando...');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts = this.maxReconnectAttempts; // Impede reconexão
    this.pendingAcks.clear();

    if (this.ws) {
      this.ws.onclose = null; // Evita trigger de reconexão
      this.ws.close();
      this.ws = null;
    }

    this.setState('disconnected');
  }

  /** Reseta o contador de reconexão (útil ao reconectar manualmente) */
  resetReconnect(): void {
    this.reconnectAttempts = 0;
  }
}

/** Instância singleton do serviço WebSocket */
export const wsService = new WebSocketService();
