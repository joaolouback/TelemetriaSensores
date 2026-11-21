/**
 * Tela de Ranking — UVV Go
 *
 * Classificação geral dos jogadores, calculada pela API a partir da pontuação real.
 * Mostra a posição do usuário logado mesmo quando ele está fora da lista.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';
import { PerfilJogadorSheet } from '../components/PerfilJogadorSheet';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';
import { useAuth } from '../contexts/AuthContext';
import { buscarRanking } from '../services/ranking';
import { JogadorRanking, Ranking } from '../types';
import { calcularNivel } from '../utils/nivel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Cores dos degraus do pódio: ouro, prata e bronze, em tons discretos. */
const COR_PODIO = { 1: '#C9A227', 2: '#9AA3B2', 3: '#B87333' } as const;
const ALTURA_DEGRAU = { 1: 110, 2: 80, 3: 58 } as const;
const TAMANHO_AVATAR = { 1: 72, 2: 58, 3: 58 } as const;

function Podio({
  jogadores,
  euId,
  onAbrir,
}: {
  jogadores: JogadorRanking[];
  euId: number;
  onAbrir: (id: number) => void;
}) {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
  // Ordem visual: 2º, 1º, 3º — o campeão no meio.
  const ordem = [2, 1, 3] as const;

  return (
    <View style={styles.podio} accessibilityLabel="Pódio dos três primeiros colocados">
      {ordem.map((posicao) => {
        const jogador = jogadores.find((j) => j.posicao === posicao);
        const cor = COR_PODIO[posicao];
        const souEu = jogador?.id === euId;

        return (
          <TouchableOpacity
            key={posicao}
            style={styles.podioColuna}
            activeOpacity={0.8}
            disabled={!jogador}
            onPress={() => jogador && onAbrir(jogador.id)}
            accessibilityRole="button"
            accessibilityLabel={jogador ? `${posicao}º lugar, ${jogador.nome}. Toque para ver o perfil` : `${posicao}º lugar vago`}
          >
            {posicao === 1 && jogador && (
              <Ionicons name="trophy" size={20} color={cor} style={styles.podioTrofeu} />
            )}

            {jogador ? (
              <View style={[styles.podioFoto, { borderColor: cor }]}>
                <Avatar
                  nome={jogador.nome}
                  fotoUrl={jogador.fotoUrl}
                  tamanho={TAMANHO_AVATAR[posicao]}
                  cor={cores.textMuted}
                />
              </View>
            ) : (
              <View
                style={[
                  styles.podioFoto,
                  styles.podioVazio,
                  { width: TAMANHO_AVATAR[posicao] + 6, height: TAMANHO_AVATAR[posicao] + 6 },
                ]}
              />
            )}

            <Text style={[styles.podioNome, souEu && styles.nomeDestaque]} numberOfLines={1}>
              {jogador ? jogador.nome : 'Vaga aberta'}
            </Text>
            <Text style={styles.podioPontos}>
              {jogador ? `${jogador.pontuacaoTotal.toLocaleString('pt-BR')} pts` : '—'}
            </Text>

            <View style={[styles.degrau, { height: ALTURA_DEGRAU[posicao], backgroundColor: cor }]}>
              <Text style={styles.degrauNumero}>{posicao}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Linha({ jogador, souEu, onAbrir }: { jogador: JogadorRanking; souEu: boolean; onAbrir: (id: number) => void }) {
  const styles = useEstilos(criarEstilos);
  const nivel = calcularNivel(jogador.pontuacaoTotal);

  return (
    <TouchableOpacity
      style={[styles.linha, souEu && styles.linhaDestaque]}
      activeOpacity={0.7}
      onPress={() => onAbrir(jogador.id)}
      accessibilityRole="button"
      accessibilityLabel={`${jogador.posicao}º lugar, ${jogador.nome}, ${jogador.pontuacaoTotal} pontos${souEu ? ', você' : ''}. Toque para ver o perfil`}
    >
      <Text style={styles.posicaoTexto}>{jogador.posicao}</Text>

      <View style={styles.avatar}>
        <Avatar nome={jogador.nome} fotoUrl={jogador.fotoUrl} tamanho={36} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.nome, souEu && styles.nomeDestaque]} numberOfLines={1}>
          {jogador.nome}
          {souEu ? ' (você)' : ''}
        </Text>
        <Text style={styles.nivel}>
          Nível {nivel.nivel} · {nivel.titulo}
        </Text>
      </View>

      <Text style={[styles.pontos, souEu && styles.nomeDestaque]}>
        {jogador.pontuacaoTotal.toLocaleString('pt-BR')}
        <Text style={styles.pontosSufixo}> pts</Text>
      </Text>
    </TouchableOpacity>
  );
}

export function RankingScreen() {
  const insets = useSafeAreaInsets();
  const styles = useEstilos(criarEstilos);
  const { cores, barraStatus } = useTema();
  const { usuario } = useAuth();
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [jogadorAberto, setJogadorAberto] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    try {
      setRanking(await buscarRanking());
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar o ranking.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  // A pontuação muda a cada coleta: recarregar com ela mantém o ranking em dia.
  const usuarioId = usuario?.id;
  const pontuacao = usuario?.pontuacaoTotal;
  useEffect(() => {
    if (!usuarioId) return;
    carregar();
    // `pontuacao` não é lida aqui: é o gatilho que dispara a recarga após uma coleta.
  }, [usuarioId, pontuacao, carregar]);

  const aoPuxar = () => {
    setAtualizando(true);
    carregar();
  };

  const euForaDaLista = ranking && !ranking.jogadores.some((j) => j.id === ranking.eu.id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barraStatus} backgroundColor={cores.background} />

      <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
        <Text style={styles.headerTitulo}>Ranking</Text>
        <Text style={styles.headerSubtitulo}>Classificação geral dos jogadores</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoPuxar} />}
      >
        {carregando && !ranking && (
          <ActivityIndicator style={styles.estado} color={cores.discoverBlue} />
        )}

        {erro && (
          <View style={styles.estado}>
            <Text style={styles.estadoTexto}>{erro}</Text>
            <TouchableOpacity style={styles.botao} onPress={aoPuxar} accessibilityRole="button">
              <Text style={styles.botaoTexto}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        )}

        {ranking && (
          <>
            <View style={styles.resumo}>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoValor}>{ranking.eu.posicao}º</Text>
                <Text style={styles.resumoRotulo}>Sua posição</Text>
              </View>
              <View style={styles.resumoDivisor} />
              <View style={styles.resumoItem}>
                <Text style={styles.resumoValor}>
                  {ranking.eu.pontuacaoTotal.toLocaleString('pt-BR')}
                </Text>
                <Text style={styles.resumoRotulo}>Seus pontos</Text>
              </View>
              <View style={styles.resumoDivisor} />
              <View style={styles.resumoItem}>
                <Text style={styles.resumoValor}>{ranking.total}</Text>
                <Text style={styles.resumoRotulo}>
                  {ranking.total === 1 ? 'Jogador' : 'Jogadores'}
                </Text>
              </View>
            </View>

            <Podio jogadores={ranking.jogadores} euId={ranking.eu.id} onAbrir={setJogadorAberto} />

            <View style={styles.lista}>
              {ranking.jogadores.slice(3).map((jogador) => (
                <Linha
                  key={jogador.id}
                  jogador={jogador}
                  souEu={jogador.id === ranking.eu.id}
                  onAbrir={setJogadorAberto}
                />
              ))}
              {euForaDaLista && (
                <>
                  <Text style={styles.reticencias}>···</Text>
                  <Linha jogador={ranking.eu} souEu onAbrir={setJogadorAberto} />
                </>
              )}
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <PerfilJogadorSheet jogadorId={jogadorAberto} onFechar={() => setJogadorAberto(null)} />
    </View>
  );
}

const criarEstilos = (cores: Tema) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitulo: {
    fontSize: 26,
    fontWeight: '800',
    color: cores.textPrimary,
  },
  headerSubtitulo: {
    fontSize: 14,
    color: cores.textSecondary,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  estado: {
    marginTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  estadoTexto: {
    color: cores.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: cores.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  resumo: {
    flexDirection: 'row',
    backgroundColor: cores.accent,
    borderRadius: 14,
    paddingVertical: 18,
    marginBottom: 16,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumoValor: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  resumoRotulo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  resumoDivisor: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  podio: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  podioColuna: {
    flex: 1,
    alignItems: 'center',
  },
  podioTrofeu: {
    marginBottom: 4,
  },
  podioFoto: {
    borderRadius: 999,
    borderWidth: 3,
    marginBottom: 8,
  },
  podioVazio: {
    borderStyle: 'dashed',
    borderColor: cores.cardBorder,
  },
  podioNome: {
    fontSize: 13,
    fontWeight: '800',
    color: cores.textPrimary,
    maxWidth: '100%',
  },
  podioPontos: {
    fontSize: 12,
    color: cores.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  degrau: {
    alignSelf: 'stretch',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  degrauNumero: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },

  lista: {
    backgroundColor: cores.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.cardBorder,
    overflow: 'hidden',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.cardBorder,
  },
  linhaDestaque: {
    backgroundColor: cores.missionIconBg,
  },
  posicaoTexto: {
    width: 26,
    fontSize: 14,
    fontWeight: '700',
    color: cores.textMuted,
  },
  avatar: {
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  nome: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.textPrimary,
  },
  nomeDestaque: {
    color: cores.accent,
  },
  nivel: {
    fontSize: 12,
    color: cores.textSecondary,
    marginTop: 1,
  },
  pontos: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.textPrimary,
  },
  pontosSufixo: {
    fontSize: 11,
    fontWeight: '600',
    color: cores.textSecondary,
  },
  reticencias: {
    textAlign: 'center',
    color: cores.textMuted,
    paddingVertical: 4,
    letterSpacing: 4,
  },
});
