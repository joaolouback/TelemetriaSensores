/** Serviço para sincronização de logs — WebSocket (primário) com fallback HTTP */
import { getUnsyncedLogs, markLogsAsSynced, limparLogsSincronizados } from '../database/database';
import { API_URL } from '../constants';
import { SensorLog } from '../types';
import { wsService } from './websocket';
import { getToken, getUsuarioId } from './auth';

/**
 * Registros por envio. Depois de horas offline o acumulado passa de milhares;
 * mandar tudo de uma vez estoura o limite de corpo da API e trava o sync.
 */
const LOTE_SYNC = 200;
/** Registros já enviados ficam no aparelho por este tempo e depois são apagados. */
const DIAS_RETENCAO_LOCAL = 7;

// Evita dois envios simultâneos do mesmo lote (a coleta dispara um sync a cada gravação,
// e offline/rede lenta uma tentativa pode demorar mais que o intervalo de coleta).
let syncEmAndamento: Promise<number> | null = null;

/**
 * Sincroniza logs pendentes com o servidor, em lotes.
 * Tenta primeiro via WebSocket (conexão persistente).
 * Se WS não estiver disponível, faz fallback para HTTP POST.
 * Com usuário logado, o token vai junto e o backend associa os registros a ele.
 */
export function syncLogsWithApi(): Promise<number> {
  if (!syncEmAndamento) {
    syncEmAndamento = sincronizar().finally(() => {
      syncEmAndamento = null;
    });
  }
  return syncEmAndamento;
}

async function sincronizar(): Promise<number> {
  let total = 0;

  try {
    // Lote a lote até esvaziar a fila; para no primeiro erro e tenta de novo no próximo ciclo.
    for (;;) {
      const lote = await getUnsyncedLogs(getUsuarioId(), LOTE_SYNC);
      if (lote.length === 0) break;

      console.log(`[Sync] Enviando lote de ${lote.length} logs. WS conectado: ${wsService.isConnected}`);
      total += await enviarLote(lote);

      if (lote.length < LOTE_SYNC) break;
    }

    if (total === 0) {
      console.log('[Sync] Nenhum log pendente para sincronizar.');
    }
  } catch (error) {
    console.error(`[Sync] Falha na sincronização (${total} enviados antes do erro):`, error);
  }

  try {
    const apagados = await limparLogsSincronizados(DIAS_RETENCAO_LOCAL);
    if (apagados > 0) console.log(`[Sync] ${apagados} logs antigos já sincronizados removidos do aparelho.`);
  } catch (error) {
    console.warn('[Sync] Falha ao limpar logs antigos:', error);
  }

  return total;
}

/** Envia um lote (WS ou HTTP) e marca como sincronizado. Lança erro se os dois falharem. */
async function enviarLote(lote: SensorLog[]): Promise<number> {
  const token = getToken();
  let syncedCount: number | null = null;

  // ------ Tentativa 1: WebSocket (tempo real) ------
  if (wsService.isConnected) {
    syncedCount = await wsService.sendLogs(lote, token);

    if (syncedCount === null) {
      console.warn('[Sync] WebSocket falhou, tentando HTTP...');
    }
  }

  // ------ Tentativa 2: HTTP POST (fallback) ------
  if (syncedCount === null) {
    const response = await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(lote),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    syncedCount = lote.length;
  }

  // ------ Marca como sincronizados no SQLite ------
  const syncedIds = lote.map((log) => log.id).filter((id): id is number => id !== undefined);
  await markLogsAsSynced(syncedIds);

  console.log(`[Sync] Lote OK: ${syncedIds.length} logs sincronizados.`);
  return syncedIds.length;
}
