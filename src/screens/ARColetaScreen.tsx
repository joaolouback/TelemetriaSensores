/**
 * Coleta em Realidade Aumentada (CS04 — Interagir com Objeto 3D).
 *
 * Aberta pelo mapa quando o jogador está dentro do raio de um ponto. Usa o ARCore
 * (via ViroReact) para encontrar o chão e posicionar o objeto 3D do ponto. Só ao
 * tocar no objeto o check-in é enviado e os pontos são creditados.
 *
 * Se nenhuma superfície for detectada em alguns segundos (chão liso, pouca luz),
 * o objeto aparece flutuando à frente da câmera para não travar o jogador.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Linking,
} from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroARPlane,
  ViroNode,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroAnimations,
  ViroTrackingStateConstants,
  isARSupportedOnDevice,
  requestRequiredPermissions,
} from '@reactvision/react-viro';
import { HOME_COLORS, SERVER_URL } from '../constants';
import { registrarCheckin, CheckinError } from '../services/interacoes';
import { LocationData, PontoComDistancia, ResultadoCheckin } from '../types';

/** Tempo procurando o chão antes de mostrar o objeto flutuando. */
const TEMPO_BUSCA_SUPERFICIE_MS = 8_000;
const MODELO_PADRAO = '/modelos/cristal.glb';
const ESCALA_PADRAO = 0.25;

ViroAnimations.registerAnimations({
  girar: { properties: { rotateY: '+=90' }, duration: 1000 },
  flutuarSubir: { properties: { positionY: '+=0.05' }, duration: 900, easing: 'EaseInEaseOut' },
  flutuarDescer: { properties: { positionY: '-=0.05' }, duration: 900, easing: 'EaseInEaseOut' },
  // Cadeia (sobe e desce). O nativo aceita, mas a tipagem do Viro só prevê animações simples.
  flutuar: [['flutuarSubir', 'flutuarDescer']] as any,
  coletar: {
    properties: { scaleX: 0, scaleY: 0, scaleZ: 0, positionY: '+=0.4' },
    duration: 450,
    easing: 'EaseIn',
  },
});

type Fase =
  | 'verificando'
  | 'semSuporte'
  | 'semPermissao'
  | 'procurando'
  | 'pronto'
  | 'enviando'
  | 'coletado'
  | 'erro';

/** Dados que a cena 3D recebe do componente React (via `viroAppProps`). */
interface PropsCena {
  modeloUrl: string;
  formato: 'GLB' | 'GLTF' | 'OBJ' | 'VRX';
  escala: number;
  flutuante: boolean;
  coletado: boolean;
  onRastreamento: (normal: boolean) => void;
  onSuperficie: () => void;
  onToque: () => void;
}

function Objeto({ cena }: { cena: PropsCena }) {
  const { escala } = cena;
  return (
    <ViroNode animation={{ name: 'flutuar', run: !cena.coletado, loop: true }}>
      <Viro3DObject
        source={{ uri: cena.modeloUrl }}
        type={cena.formato}
        scale={[escala, escala, escala]}
        animation={
          cena.coletado
            ? { name: 'coletar', run: true, loop: false }
            : { name: 'girar', run: true, loop: true }
        }
        onClick={cena.coletado ? undefined : cena.onToque}
        onError={(e) => console.warn('[AR] Falha ao carregar o modelo 3D:', e.nativeEvent)}
      />
    </ViroNode>
  );
}

function CenaColeta(props: { sceneNavigator: { viroAppProps: PropsCena } }) {
  const cena = props.sceneNavigator.viroAppProps;

  return (
    <ViroARScene
      onTrackingUpdated={(estado) =>
        cena.onRastreamento(estado === ViroTrackingStateConstants.TRACKING_NORMAL)
      }
    >
      <ViroAmbientLight color="#FFFFFF" intensity={300} />
      <ViroDirectionalLight color="#FFFFFF" direction={[0, -1, -0.3]} intensity={800} />

      {cena.flutuante ? (
        // Sem chão detectado: 1,2 m à frente e um pouco abaixo de onde a câmera abriu.
        <ViroNode position={[0, -0.25, -1.2]}>
          <Objeto cena={cena} />
        </ViroNode>
      ) : (
        // O ARPlane só exibe os filhos depois que o ARCore encontra uma superfície.
        <ViroARPlane minHeight={0.3} minWidth={0.3} alignment="Horizontal" onAnchorFound={cena.onSuperficie}>
          <ViroNode position={[0, 0.2, 0]}>
            <Objeto cena={cena} />
          </ViroNode>
        </ViroARPlane>
      )}
    </ViroARScene>
  );
}

/** `assetUrl` relativo (servido pela API) vira URL absoluta. */
function resolverModelo(ponto: PontoComDistancia) {
  const objeto = ponto.objeto3d;
  const url = objeto?.assetUrl || MODELO_PADRAO;
  const formato = (objeto?.formato?.toUpperCase() ?? 'GLB') as PropsCena['formato'];
  return {
    modeloUrl: /^https?:\/\//.test(url) ? url : `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`,
    formato: ['GLB', 'GLTF', 'OBJ', 'VRX'].includes(formato) ? formato : 'GLB',
    escala: objeto?.escala ?? ESCALA_PADRAO,
  };
}

interface Props {
  ponto: PontoComDistancia;
  /** Posição atual — enviada no check-in para o backend revalidar o geofence. */
  localizacao: LocationData | null;
  onFechar: () => void;
  onColetado: (pontoId: number, resultado: ResultadoCheckin) => void;
  /** O backend respondeu que o ponto já tinha sido coletado. */
  onJaColetado: (pontoId: number) => void;
}

export function ARColetaScreen({ ponto, localizacao, onFechar, onColetado, onJaColetado }: Props) {
  const [fase, setFase] = useState<Fase>('verificando');
  const [rastreando, setRastreando] = useState(false);
  const [flutuante, setFlutuante] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [podeTentarDeNovo, setPodeTentarDeNovo] = useState(true);
  const [resultado, setResultado] = useState<ResultadoCheckin | null>(null);

  // O toque chega pela cena 3D; a ref garante a posição mais recente e evita envio duplo.
  const localizacaoRef = useRef(localizacao);
  localizacaoRef.current = localizacao;
  const enviandoRef = useRef(false);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const { isARSupported } = await isARSupportedOnDevice();
        if (cancelado) return;
        if (!isARSupported) return setFase('semSuporte');

        const permissoes = await requestRequiredPermissions(['camera']);
        if (cancelado) return;
        setFase(permissoes.camera ? 'procurando' : 'semPermissao');
      } catch (e) {
        console.error('[AR] Erro ao verificar suporte a AR:', e);
        if (!cancelado) setFase('semSuporte');
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  // Fallback: sem superfície depois de alguns segundos, mostra o objeto flutuando.
  useEffect(() => {
    if (fase !== 'procurando') return;
    const timer = setTimeout(() => setFlutuante(true), TEMPO_BUSCA_SUPERFICIE_MS);
    return () => clearTimeout(timer);
  }, [fase]);

  const onSuperficie = useCallback(() => {
    setFase((atual) => (atual === 'procurando' ? 'pronto' : atual));
  }, []);

  useEffect(() => {
    if (flutuante) onSuperficie();
  }, [flutuante, onSuperficie]);

  const onToque = useCallback(async () => {
    const posicao = localizacaoRef.current;
    if (enviandoRef.current) return;
    if (!posicao) {
      setMensagemErro('Aguardando o sinal de GPS. Tente de novo em instantes.');
      setFase('erro');
      return;
    }

    enviandoRef.current = true;
    setFase('enviando');
    setMensagemErro(null);

    try {
      const res = await registrarCheckin(ponto.id, posicao);
      setResultado(res);
      setFase('coletado');
      onColetado(ponto.id, res);
    } catch (e) {
      const erro = e instanceof CheckinError ? e : new CheckinError('Não foi possível coletar o objeto.');
      if (erro.jaColetado) onJaColetado(ponto.id);
      setPodeTentarDeNovo(!erro.jaColetado);
      setMensagemErro(erro.message);
      setFase('erro');
    } finally {
      enviandoRef.current = false;
    }
  }, [ponto.id, onColetado, onJaColetado]);

  const cena: PropsCena = {
    ...resolverModelo(ponto),
    flutuante,
    coletado: fase === 'coletado',
    onRastreamento: setRastreando,
    onSuperficie,
    onToque,
  };

  const exibirCamera = !['verificando', 'semSuporte', 'semPermissao'].includes(fase);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {exibirCamera && (
        <ViroARSceneNavigator
          style={StyleSheet.absoluteFill}
          autofocus
          initialScene={{ scene: CenaColeta as unknown as () => React.JSX.Element }}
          viroAppProps={cena}
        />
      )}

      {/* Topo: nome do ponto e botão de fechar */}
      <View style={styles.topo}>
        <View style={styles.topoTextos}>
          <Text style={styles.topoRotulo}>Coleta em AR</Text>
          <Text style={styles.topoTitulo} numberOfLines={1}>
            {ponto.nome}
          </Text>
        </View>
        <TouchableOpacity style={styles.fechar} onPress={onFechar} activeOpacity={0.8}>
          <Text style={styles.fecharTexto}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Instrução / estado */}
      <View style={styles.rodape}>
        <Rodape
          fase={fase}
          rastreando={rastreando}
          flutuante={flutuante}
          pontos={ponto.pontosRecompensa}
          mensagemErro={mensagemErro}
          resultado={resultado}
          onFechar={onFechar}
          onTentarDeNovo={podeTentarDeNovo ? () => setFase('pronto') : undefined}
        />
      </View>
    </View>
  );
}

function Rodape(props: {
  fase: Fase;
  rastreando: boolean;
  flutuante: boolean;
  pontos: number;
  mensagemErro: string | null;
  resultado: ResultadoCheckin | null;
  onFechar: () => void;
  /** Ausente quando repetir não adianta (ex.: o ponto já foi coletado). */
  onTentarDeNovo?: () => void;
}) {
  const { fase, resultado } = props;

  switch (fase) {
    case 'verificando':
      return (
        <View style={styles.cartao}>
          <ActivityIndicator color={HOME_COLORS.discoverBlue} />
          <Text style={styles.cartaoTexto}>Preparando a câmera...</Text>
        </View>
      );

    case 'semSuporte':
      return (
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>AR indisponível neste aparelho</Text>
          <Text style={styles.cartaoTexto}>
            Este celular não é compatível com o ARCore, ou o app "Google Play Services para
            RA" não está instalado.
          </Text>
          <Botao texto="Voltar ao mapa" onPress={props.onFechar} />
        </View>
      );

    case 'semPermissao':
      return (
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Câmera bloqueada</Text>
          <Text style={styles.cartaoTexto}>
            Libere o acesso à câmera para ver e coletar o objeto deste ponto.
          </Text>
          <Botao texto="Abrir configurações" onPress={() => Linking.openSettings()} />
          <Botao texto="Voltar ao mapa" secundario onPress={props.onFechar} />
        </View>
      );

    case 'procurando':
      return (
        <View style={styles.cartao}>
          <ActivityIndicator color={HOME_COLORS.discoverBlue} />
          <Text style={styles.cartaoTexto}>
            {props.rastreando
              ? 'Aponte a câmera para o chão e mova o celular devagar...'
              : 'Movimente o celular devagar para o ARCore reconhecer o ambiente...'}
          </Text>
        </View>
      );

    case 'pronto':
      return (
        <View style={[styles.cartao, styles.cartaoDestaque]}>
          <Text style={styles.cartaoTitulo}>Toque no cristal para coletar!</Text>
          <Text style={styles.cartaoTexto}>
            Vale {props.pontos} pontos.
            {props.flutuante ? ' Olhe ao redor: ele está flutuando à sua frente.' : ''}
          </Text>
        </View>
      );

    case 'enviando':
      return (
        <View style={styles.cartao}>
          <ActivityIndicator color={HOME_COLORS.discoverBlue} />
          <Text style={styles.cartaoTexto}>Validando sua posição...</Text>
        </View>
      );

    case 'coletado':
      return (
        <View style={[styles.cartao, styles.cartaoSucesso]}>
          <Text style={styles.sucessoPontos}>+{resultado?.pontosGanhos ?? props.pontos} pontos</Text>
          <Text style={styles.cartaoTexto}>
            Objeto coletado! Sua pontuação agora é {resultado?.pontuacaoTotal ?? '—'}.
          </Text>
          {resultado?.novasConquistas.map((c) => (
            <Text key={c.id} style={styles.conquista}>
              🏅 Conquista desbloqueada: {c.titulo}
            </Text>
          ))}
          <Botao texto="Voltar ao mapa" onPress={props.onFechar} />
        </View>
      );

    case 'erro':
      return (
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Não deu certo</Text>
          <Text style={styles.cartaoTexto}>{props.mensagemErro}</Text>
          {props.onTentarDeNovo && <Botao texto="Tentar de novo" onPress={props.onTentarDeNovo} />}
          <Botao texto="Voltar ao mapa" secundario={!!props.onTentarDeNovo} onPress={props.onFechar} />
        </View>
      );
  }
}

function Botao({ texto, onPress, secundario }: { texto: string; onPress: () => void; secundario?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.botao, secundario && styles.botaoSecundario]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.botaoTexto, secundario && styles.botaoTextoSecundario]}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  topoTextos: {
    flex: 1,
    marginRight: 12,
  },
  topoRotulo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  topoTitulo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  fechar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fecharTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  rodape: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
  },
  cartao: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 16,
    padding: 18,
    gap: 8,
    alignItems: 'center',
    elevation: 8,
  },
  cartaoDestaque: {
    borderWidth: 2,
    borderColor: HOME_COLORS.xpGold,
  },
  cartaoSucesso: {
    borderWidth: 2,
    borderColor: HOME_COLORS.success,
  },
  cartaoTitulo: {
    color: HOME_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  cartaoTexto: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sucessoPontos: {
    color: HOME_COLORS.successText,
    fontSize: 28,
    fontWeight: '900',
  },
  conquista: {
    color: HOME_COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  botao: {
    alignSelf: 'stretch',
    backgroundColor: HOME_COLORS.discoverBlue,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  botaoSecundario: {
    backgroundColor: 'transparent',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  botaoTextoSecundario: {
    color: HOME_COLORS.textSecondary,
  },
});
