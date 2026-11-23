/**
 * Coleta em Realidade Aumentada (CS04 — Interagir com Objeto 3D).
 *
 * Aberta pelo mapa quando o jogador está dentro do raio de um ponto. Usa o ARCore
 * (via ViroReact) para encontrar o chão e posicionar o objeto 3D do ponto. Só ao
 * tocar no objeto o check-in é enviado e os pontos são creditados.
 *
 * Se nenhuma superfície for detectada em ~10 s (chão liso, pouca luz), o app sugere
 * dicas e oferece um botão para mostrar o objeto flutuando à frente da câmera. Sem
 * ação do jogador, ele aparece sozinho depois de mais alguns segundos.
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
  ViroARPlaneSelector,
  ViroNode,
  Viro3DObject,
  ViroSphere,
  ViroImage,
  ViroMaterials,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroAnimations,
  ViroTrackingStateConstants,
  isARSupportedOnDevice,
  requestRequiredPermissions,
} from '@reactvision/react-viro';
import { CardLocal } from '../components/CardLocal';
import { urlDoServidor } from '../utils/url';
import { vibrarSucesso, vibrarErro } from '../utils/vibracao';
import { Ionicons } from '@expo/vector-icons';
import { registrarCheckin, CheckinError } from '../services/interacoes';
import { LocationData, PontoComDistancia, ResultadoCheckin } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';

/** Tempo procurando o chão antes de sugerir dicas e o botão de mostrar o objeto. */
const TEMPO_DICA_MS = 10_000;
/** Tempo procurando o chão antes de mostrar o objeto flutuando automaticamente. */
const TEMPO_BUSCA_SUPERFICIE_MS = 20_000;
const MODELO_PADRAO = '/modelos/cristal.glb';
const ESCALA_PADRAO = 0.25;

ViroMaterials.createMaterials({
  // Usado no lugar do modelo 3D se o download do GLB falhar.
  cristalReserva: { diffuseColor: '#29B6F6', lightingModel: 'Blinn' },
});

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

type EstadoModelo = 'carregando' | 'ok' | 'erro';

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
  /** Foto circular do local, desenhada dentro do anel (vazia se o modelo não for um anel). */
  fotoUrl: string | null;
  formato: 'GLB' | 'GLTF' | 'OBJ' | 'VRX';
  escala: number;
  flutuante: boolean;
  coletado: boolean;
  onModelo: (estado: EstadoModelo) => void;
  onRastreamento: (normal: boolean) => void;
  onSuperficie: () => void;
  onToque: () => void;
}

/** Raio e centro (altura) da foto no modelo do anel (scripts/gerar-modelo-3d.ts), em unidades do GLB. */
const FOTO_RAIO_MODELO = 0.48;
const FOTO_CENTRO_Y_MODELO = -0.15;

function Objeto({ cena }: { cena: PropsCena }) {
  const { escala } = cena;
  const [falhou, setFalhou] = useState(false);
  const animacao = cena.coletado
    ? { name: 'coletar', run: true, loop: false }
    : { name: 'girar', run: true, loop: true };
  const aoTocar = cena.coletado ? undefined : cena.onToque;

  const lado = 2 * FOTO_RAIO_MODELO * escala;
  const centroY = FOTO_CENTRO_Y_MODELO * escala;

  return (
    <ViroNode animation={{ name: 'flutuar', run: !cena.coletado, loop: true }}>
      <ViroNode animation={animacao}>
        {falhou && !cena.fotoUrl ? (
          // Sem o GLB (e sem foto), uma esfera simples permite testar a coleta mesmo assim.
          <ViroSphere radius={0.1} materials={['cristalReserva']} onClick={aoTocar} />
        ) : (
          <>
            {!falhou && (
              <Viro3DObject
                source={{ uri: cena.modeloUrl }}
                type={cena.formato}
                scale={[escala, escala, escala]}
                onClick={aoTocar}
                onLoadStart={() => cena.onModelo('carregando')}
                onLoadEnd={() => cena.onModelo('ok')}
                onError={(e) => {
                  console.warn('[AR] Falha ao carregar o modelo 3D:', cena.modeloUrl, e.nativeEvent);
                  setFalhou(true);
                  cena.onModelo('erro');
                }}
              />
            )}
            {cena.fotoUrl && (
              <>
                <ViroImage
                  source={{ uri: cena.fotoUrl }}
                  width={lado}
                  height={lado}
                  position={[0, centroY, 0.003]}
                  onClick={aoTocar}
                />
                <ViroImage
                  source={{ uri: cena.fotoUrl }}
                  width={lado}
                  height={lado}
                  position={[0, centroY, -0.003]}
                  rotation={[0, 180, 0]}
                  onClick={aoTocar}
                />
              </>
            )}
          </>
        )}
      </ViroNode>
    </ViroNode>
  );
}

/** Distância à frente da câmera em que o objeto flutuante é colocado. */
const DISTANCIA_FLUTUANTE_M = 1.0;
type Ponto3D = [number, number, number];

function CenaColeta(props: { sceneNavigator: { viroAppProps: PropsCena } }) {
  const cena = props.sceneNavigator.viroAppProps;

  // Última posição/direção da câmera: o objeto flutuante nasce na frente de onde o
  // jogador está olhando quando ele aparece, não de onde a câmera abriu.
  const camera = useRef<{ posicao: Ponto3D; frente: Ponto3D } | null>(null);
  const [posicaoFlutuante, setPosicaoFlutuante] = useState<Ponto3D | null>(null);

  useEffect(() => {
    if (!cena.flutuante || posicaoFlutuante) return;
    const c = camera.current;
    setPosicaoFlutuante(
      c
        ? [
            c.posicao[0] + c.frente[0] * DISTANCIA_FLUTUANTE_M,
            c.posicao[1] + c.frente[1] * DISTANCIA_FLUTUANTE_M,
            c.posicao[2] + c.frente[2] * DISTANCIA_FLUTUANTE_M,
          ]
        : [0, -0.25, -1.2]
    );
  }, [cena.flutuante, posicaoFlutuante]);

  return (
    <ViroARScene
      onTrackingUpdated={(estado) =>
        cena.onRastreamento(estado === ViroTrackingStateConstants.TRACKING_NORMAL)
      }
      onCameraTransformUpdate={(t) => {
        camera.current = { posicao: t.position as Ponto3D, frente: t.forward as Ponto3D };
      }}
    >
      <ViroAmbientLight color="#FFFFFF" intensity={300} />
      <ViroDirectionalLight color="#FFFFFF" direction={[0, -1, -0.3]} intensity={800} />

      {cena.flutuante ? (
        // Sem chão detectado: 1 m à frente de onde a câmera apontava ao aparecer.
        posicaoFlutuante && (
          <ViroNode position={posicaoFlutuante}>
            <Objeto cena={cena} />
          </ViroNode>
        )
      ) : (
        // O ARCore desenha as áreas translúcidas que encontra no chão. O objeto só é
        // carregado depois que o jogador toca em uma delas, exatamente no ponto tocado.
        <ViroARPlaneSelector minHeight={0.3} minWidth={0.3} alignment="HorizontalUpward" onPlaneSelected={cena.onSuperficie}>
          <ViroNode position={[0, 0.2, 0]}>
            <Objeto cena={cena} />
          </ViroNode>
        </ViroARPlaneSelector>
      )}
    </ViroARScene>
  );
}

/** `assetUrl` relativo (servido pela API) vira URL absoluta. */
function resolverModelo(ponto: PontoComDistancia) {
  const objeto = ponto.objeto3d;
  const url = objeto?.assetUrl || MODELO_PADRAO;
  const formato = (objeto?.formato?.toUpperCase() ?? 'GLB') as PropsCena['formato'];
  // Os anéis têm a foto do local em `anel-<slug>.png`, ao lado do GLB.
  const fotoUrl = /\/anel-[\w-]+\.glb$/.test(url) ? urlDoServidor(url.replace(/\.glb$/, '.png')) : null;
  return {
    modeloUrl: urlDoServidor(url),
    fotoUrl,
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
  /** O ponto já foi coletado no jogo normal (o toque só vale para o desafio). */
  jaColetado: boolean;
  /** O ponto faz parte do desafio em andamento e ainda falta coletá-lo. */
  valeNoDesafio: boolean;
}

export function ARColetaScreen({
  ponto,
  localizacao,
  onFechar,
  onColetado,
  onJaColetado,
  jaColetado,
  valeNoDesafio,
}: Props) {
  const styles = useEstilos(criarEstilos);
  const insets = useSafeAreaInsets();
  const [fase, setFase] = useState<Fase>('verificando');
  const [rastreando, setRastreando] = useState(false);
  const [flutuante, setFlutuante] = useState(false);
  const [demorando, setDemorando] = useState(false);
  const [modelo, setModelo] = useState<EstadoModelo>('carregando');
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

  // Sem superfície: primeiro sugere dicas e o botão; depois mostra o objeto flutuando sozinho.
  useEffect(() => {
    if (fase !== 'procurando') return;
    const dica = setTimeout(() => setDemorando(true), TEMPO_DICA_MS);
    const fallback = setTimeout(() => setFlutuante(true), TEMPO_BUSCA_SUPERFICIE_MS);
    return () => {
      clearTimeout(dica);
      clearTimeout(fallback);
    };
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
      vibrarSucesso();
      setResultado(res);
      setFase('coletado');
      onColetado(ponto.id, res);
    } catch (e) {
      const erro = e instanceof CheckinError ? e : new CheckinError('Não foi possível coletar o objeto.');
      vibrarErro();
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
    onModelo: setModelo,
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
      <View style={[styles.topo, { paddingTop: insets.top + 28 }]}>
        <View style={styles.topoTextos}>
          <Text style={styles.topoRotulo}>Coleta em AR</Text>
          <Text style={styles.topoTitulo} numberOfLines={1}>
            {ponto.nome}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.fechar}
          onPress={onFechar}
          activeOpacity={0.8}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Fechar câmera e voltar ao mapa"
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Instrução / estado */}
      <View style={[styles.rodape, { bottom: insets.bottom + 24 }]}>
        <Rodape
          fase={fase}
          rastreando={rastreando}
          flutuante={flutuante}
          demorando={demorando}
          modelo={modelo}
          onMostrarAgora={() => setFlutuante(true)}
          ponto={ponto}
          valor={
            valeNoDesafio && jaColetado
              ? 'Conta para o seu desafio!'
              : valeNoDesafio
                ? `Vale ${ponto.pontosRecompensa} pontos e conta para o seu desafio!`
                : `Vale ${ponto.pontosRecompensa} pontos.`
          }
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
  /** A busca pelo chão passou de ~10 s: mostra dicas e o botão de mostrar o objeto. */
  demorando: boolean;
  modelo: EstadoModelo;
  onMostrarAgora: () => void;
  ponto: PontoComDistancia;
  /** Texto do que o toque vale (pontos e/ou desafio). */
  valor: string;
  mensagemErro: string | null;
  resultado: ResultadoCheckin | null;
  onFechar: () => void;
  /** Ausente quando repetir não adianta (ex.: o ponto já foi coletado). */
  onTentarDeNovo?: () => void;
}) {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
  const { fase, resultado } = props;

  switch (fase) {
    case 'verificando':
      return (
        <View style={styles.cartao}>
          <ActivityIndicator color={cores.discoverBlue} />
          <Text style={styles.cartaoTexto}>Preparando a câmera...</Text>
        </View>
      );

    case 'semSuporte':
      return (
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>AR indisponível neste aparelho</Text>
          <Text style={styles.cartaoTexto}>
            Este celular não é compatível com o ARCore, ou o app “Google Play Services para
            RA” não está instalado.
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
          <ActivityIndicator color={cores.discoverBlue} />
          <Text style={styles.cartaoTexto}>
            {props.rastreando
              ? 'Aponte a câmera para o chão. Quando uma área azul aparecer, toque nela para colocar o cristal.'
              : 'Movimente o celular devagar para o ARCore reconhecer o ambiente...'}
          </Text>
          {props.demorando && (
            <>
              <Text style={styles.cartaoTitulo}>Está difícil achar o chão?</Text>
              <Text style={styles.cartaoTexto}>
                Procure um local bem iluminado e uma superfície com textura (piso com
                desenho, grama, calçada). Evite chão liso, brilhante ou muito escuro.
              </Text>
              <Botao texto="Mostrar o objeto mesmo assim" onPress={props.onMostrarAgora} />
            </>
          )}
        </View>
      );

    case 'pronto':
      return (
        <View style={[styles.cartao, styles.cartaoDestaque]}>
          <Text style={styles.cartaoTitulo}>
            {props.modelo === 'carregando' ? 'Carregando o cristal...' : 'Toque no cristal para coletar!'}
          </Text>
          <Text style={styles.cartaoTexto}>
            {props.valor}
            {props.flutuante ? ' Olhe ao redor: ele está flutuando à sua frente.' : ''}
            {props.modelo === 'erro'
              ? ' Não consegui baixar o modelo 3D da API, então mostro um cristal simples.'
              : ''}
          </Text>
        </View>
      );

    case 'enviando':
      return (
        <View style={styles.cartao}>
          <ActivityIndicator color={cores.discoverBlue} />
          <Text style={styles.cartaoTexto}>Validando sua posição...</Text>
        </View>
      );

    case 'coletado':
      return resultado ? (
        <CardLocal ponto={props.ponto} resultado={resultado} onFechar={props.onFechar} />
      ) : null;

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
  const styles = useEstilos(criarEstilos);
  return (
    <TouchableOpacity
      style={[styles.botao, secundario && styles.botaoSecundario]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
    >
      <Text style={[styles.botaoTexto, secundario && styles.botaoTextoSecundario]}>{texto}</Text>
    </TouchableOpacity>
  );
}

const criarEstilos = (cores: Tema) => StyleSheet.create({
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
  rodape: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  cartao: {
    backgroundColor: cores.superficieTranslucida,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    alignItems: 'center',
    elevation: 8,
  },
  cartaoDestaque: {
    borderWidth: 2,
    borderColor: cores.xpGold,
  },
  cartaoTitulo: {
    color: cores.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  cartaoTexto: {
    color: cores.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  botao: {
    alignSelf: 'stretch',
    backgroundColor: cores.discoverBlue,
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
    color: cores.textSecondary,
  },
});
