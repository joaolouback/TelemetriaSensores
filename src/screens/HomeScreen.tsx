/**
 * Tela Inicial gamificada — UVV Go
 *
 * Layout inspirado em apps gamificados, com saudação, card de nível/XP,
 * próximas coletas e seção "Descubra" com os pontos do campus — tudo com
 * os dados reais da API (pontuação, pontos e o que já foi coletado).
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { usePontos } from '../hooks/usePontos';
import { useColetas } from '../hooks/useColetas';
import { Avatar } from '../components/Avatar';
import { DetalheLocal } from '../components/DetalheLocal';
import { FolhaInferior } from '../components/FolhaInferior';
import { useNavegacao } from '../contexts/NavegacaoContext';
import { useDesafio } from '../contexts/DesafioContext';
import { PontoDeInteresse } from '../types';
import { calcularNivel, NIVEIS, PONTOS_POR_NIVEL } from '../utils/nivel';
import { CardDesafio } from '../components/CardDesafio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
/** Cartões do carrossel "Descubra": largos o bastante para o vizinho aparecer e convidar a rolar. */
const DISCOVER_CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.68);
const DISCOVER_GAP = 12;

type FiltroDescubra = 'todos' | 'disponiveis' | 'coletados';
const CORES_DESCUBRA = ['#1B2B5E', '#2A3F7E', '#26467A', '#334E7F'];
const MAX_PROXIMAS_COLETAS = 3;

function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HomeScreen() {
  const styles = useEstilos(criarEstilos);
  const { cores, barraStatus } = useTema();
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const { pontos, recarregar: recarregarPontos } = usePontos(null);
  const { coletados, recarregarColetas } = useColetas();
  const { atualizar: atualizarDesafio } = useDesafio();
  const [atualizando, setAtualizando] = useState(false);
  const [filtro, setFiltro] = useState<FiltroDescubra>('todos');
  const { irParaPonto } = useNavegacao();
  const [pontoAberto, setPontoAberto] = useState<PontoDeInteresse | null>(null);
  const [niveisAbertos, setNiveisAbertos] = useState(false);

  const pontuacao = usuario?.pontuacaoTotal ?? 0;
  const nivel = calcularNivel(pontuacao);
  const user = {
    nome: usuario?.nome.trim().split(/\s+/)[0] ?? '',
  };

  // Pendentes primeiro (os que ainda dão pontos), depois os já coletados.
  const pontosOrdenados = useMemo(
    () =>
      [...pontos].sort(
        (a, b) => Number(coletados.has(a.id)) - Number(coletados.has(b.id)) || a.id - b.id
      ),
    [pontos, coletados]
  );
  const proximasColetas = pontosOrdenados.slice(0, MAX_PROXIMAS_COLETAS);
  const todosColetados = pontos.length > 0 && coletados.size >= pontos.length;

  const descubra = useMemo(
    () =>
      pontosOrdenados.filter((p) =>
        filtro === 'todos' ? true : filtro === 'coletados' ? coletados.has(p.id) : !coletados.has(p.id)
      ),
    [pontosOrdenados, coletados, filtro]
  );
  const contagem: Record<FiltroDescubra, number> = {
    todos: pontos.length,
    disponiveis: pontos.length - coletados.size,
    coletados: coletados.size,
  };

  /** Puxar a tela para baixo recarrega pontos, coletas e desafio. */
  const atualizar = async () => {
    setAtualizando(true);
    await Promise.allSettled([recarregarPontos(), recarregarColetas(), atualizarDesafio()]);
    setAtualizando(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barraStatus} backgroundColor={cores.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
      >
        {/* ─── Header / Saudação ─── */}
        <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
          <View>
            <Text style={styles.saudacao}>{getSaudacao()},</Text>
            <Text style={styles.nome}>{user.nome}</Text>
          </View>
          <Avatar nome={usuario?.nome ?? ''} fotoUrl={usuario?.fotoUrl} tamanho={48} />
        </View>

        {/* ─── Card Nível / XP ─── */}
        <TouchableOpacity
          style={styles.xpCard}
          activeOpacity={0.9}
          onPress={() => setNiveisAbertos(true)}
          accessibilityRole="button"
          accessibilityLabel={`Nível ${nivel.nivel}, ${nivel.titulo}. Toque para ver todos os níveis`}
        >
          <View style={styles.xpCardInner}>
            <View style={styles.xpHeader}>
              <View>
                <Text style={styles.xpNivelLabel}>Nível {nivel.nivel}</Text>
                <Text style={styles.xpTitulo}>{nivel.titulo}</Text>
              </View>
              <View style={styles.xpValor}>
                <Text style={styles.xpNumero}>
                  {pontuacao.toLocaleString('pt-BR')}
                </Text>
                <Text style={styles.xpSufixo}> pts</Text>
              </View>
            </View>

            {/* Barra de progresso */}
            <View style={styles.xpBarContainer}>
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, { width: `${nivel.progresso * 100}%` }]} />
              </View>
              <Text style={styles.xpFaltando}>
                Faltam {nivel.faltam} pontos para o Nível {nivel.nivel + 1}
              </Text>
            </View>
            <View style={styles.xpVerNiveis}>
              <Text style={styles.xpVerNiveisTexto}>Ver todos os níveis</Text>
              <Ionicons name="chevron-forward" size={14} color="rgba(255, 255, 255, 0.75)" />
            </View>
          </View>
        </TouchableOpacity>

        {/* ─── Desafio 1x1 ─── */}
        <CardDesafio />

        {/* ─── Próximas coletas ─── */}
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoTitulo}>Próximas coletas</Text>
          {pontos.length > 0 && (
            <Text style={styles.secaoLink}>
              {coletados.size}/{pontos.length} coletados
            </Text>
          )}
        </View>

        {pontos.length > 0 && (
          <View
            style={styles.progressoColetas}
            accessibilityLabel={`${coletados.size} de ${pontos.length} locais coletados`}
          >
            <View style={[styles.progressoColetasPreenchido, { width: `${(coletados.size / pontos.length) * 100}%` }]} />
          </View>
        )}

        <View style={styles.missoesContainer}>
          {todosColetados && (
            <View style={styles.todosColetados}>
              <Ionicons name="trophy" size={20} color={cores.xpGold} />
              <Text style={styles.missaoDescricao}>
                Você coletou todos os locais do campus. Parabéns!
              </Text>
            </View>
          )}
          {(todosColetados ? [] : proximasColetas).map((ponto) => {
            const concluida = coletados.has(ponto.id);
            return (
              <TouchableOpacity
                key={ponto.id}
                style={styles.missaoCard}
                activeOpacity={0.8}
                onPress={() => setPontoAberto(ponto)}
                accessibilityRole="button"
                accessibilityLabel={`${ponto.nome}. Toque para ver os detalhes`}
              >
                <View style={[styles.missaoIcone, concluida && styles.missaoIconeConcluida]}>
                  <Ionicons
                    name={concluida ? 'checkmark-circle' : 'diamond'}
                    size={22}
                    color={concluida ? cores.success : cores.xpGold}
                  />
                </View>
                <View style={styles.missaoTextos}>
                  <Text style={[styles.missaoTitulo, concluida && styles.missaoTituloConcluida]}>
                    Colete o cristal: {ponto.nome}
                  </Text>
                  <Text style={styles.missaoDescricao} numberOfLines={1}>
                    {ponto.descricao ?? 'Vá até o ponto e abra a câmera AR no mapa.'}
                  </Text>
                </View>
                {concluida ? (
                  <Text style={styles.missaoFeito}>Feito</Text>
                ) : (
                  <Text style={styles.missaoXp}>+{ponto.pontosRecompensa} pts</Text>
                )}
              </TouchableOpacity>
            );
          })}
          {pontos.length === 0 && (
            <Text style={styles.missaoDescricao}>Carregando os pontos do campus...</Text>
          )}
        </View>

        {/* ─── Descubra ─── */}
        <Text style={[styles.secaoTitulo, { marginTop: 28, marginBottom: 12 }]}>
          Descubra
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
          accessibilityRole="tablist"
        >
          {(
            [
              ['todos', 'Todos'],
              ['disponiveis', 'Disponíveis'],
              ['coletados', 'Coletados'],
            ] as [FiltroDescubra, string][]
          ).map(([id, rotulo]) => (
            <TouchableOpacity
              key={id}
              style={[styles.filtro, filtro === id && styles.filtroAtivo]}
              onPress={() => setFiltro(id)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: filtro === id }}
            >
              <Text style={[styles.filtroTexto, filtro === id && styles.filtroTextoAtivo]}>
                {rotulo} · {contagem[id]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={DISCOVER_CARD_WIDTH + DISCOVER_GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.descubraLista}
        >
          {descubra.map((ponto, i) => {
            const feito = coletados.has(ponto.id);
            return (
              <TouchableOpacity
                key={ponto.id}
                style={[styles.descubraCard, { backgroundColor: CORES_DESCUBRA[i % CORES_DESCUBRA.length] }]}
                activeOpacity={0.85}
                onPress={() => setPontoAberto(ponto)}
                accessibilityRole="button"
                accessibilityLabel={`${ponto.nome}. Toque para ver os detalhes`}
              >
                <View style={styles.descubraTopo}>
                  <Ionicons name={feito ? 'checkmark-circle' : 'diamond-outline'} size={22} color="#FFFFFF" />
                  <Text style={styles.descubraChip}>{feito ? 'Coletado' : `${ponto.pontosRecompensa} pts`}</Text>
                </View>
                <View>
                  <Text style={styles.descubraNome} numberOfLines={2}>
                    {ponto.nome}
                  </Text>
                  <Text style={styles.descubraDescricao} numberOfLines={2}>
                    {ponto.descricao ?? 'Ponto de coleta do campus.'}
                  </Text>
                </View>
                <View style={styles.descubraRodape}>
                  <Text style={styles.descubraLabel}>Ver detalhes</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          })}
          {descubra.length === 0 && (
            <Text style={styles.missaoDescricao}>
              {pontos.length === 0 ? 'Carregando os pontos do campus...' : 'Nenhum local nesta lista.'}
            </Text>
          )}
        </ScrollView>

        {/* Espaço para o bottom tab */}
        <View style={{ height: 20 }} />
      </ScrollView>

      <DetalheLocal
        ponto={pontoAberto}
        coletado={pontoAberto ? coletados.has(pontoAberto.id) : false}
        onFechar={() => setPontoAberto(null)}
        onVerNoMapa={(id) => {
          setPontoAberto(null);
          irParaPonto(id);
        }}
      />

      <FolhaInferior visivel={niveisAbertos} titulo="Níveis" onFechar={() => setNiveisAbertos(false)}>
        <Text style={styles.niveisIntro}>
          A cada {PONTOS_POR_NIVEL} pontos você sobe de nível. Colete cristais nos pontos do campus para
          avançar.
        </Text>
        {NIVEIS.map((info) => {
          const alcancado = nivel.nivel >= info.nivel;
          const atual = nivel.nivel === info.nivel || (info.nivel === NIVEIS.length && nivel.nivel > NIVEIS.length);
          return (
            <View key={info.nivel} style={[styles.nivelLinha, atual && styles.nivelLinhaAtual]}>
              <View style={[styles.nivelNumero, alcancado && styles.nivelNumeroAlcancado]}>
                {alcancado && !atual ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.nivelNumeroTexto, alcancado && { color: '#FFFFFF' }]}>{info.nivel}</Text>
                )}
              </View>
              <View style={styles.nivelTextos}>
                <Text style={[styles.nivelTitulo, !alcancado && styles.nivelBloqueado]}>{info.titulo}</Text>
                <Text style={styles.nivelDescricao}>
                  {atual
                    ? `Você está aqui · faltam ${nivel.faltam} pts para o próximo`
                    : alcancado
                      ? 'Concluído'
                      : `Faltam ${Math.max(info.pontosMinimos - pontuacao, 0)} pts`}
                </Text>
              </View>
              <Text style={styles.nivelPontos}>{info.pontosMinimos} pts</Text>
            </View>
          );
        })}
      </FolhaInferior>
    </View>
  );
}

const criarEstilos = (cores: Tema) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  saudacao: {
    fontSize: 15,
    color: cores.textSecondary,
    fontWeight: '500',
  },
  nome: {
    fontSize: 28,
    fontWeight: '800',
    color: cores.textPrimary,
    marginTop: 2,
  },

  // ─── XP Card ───
  xpCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
    // Simula gradiente com fundo sólido + overlay
    backgroundColor: cores.accent,
    elevation: 8,
    shadowColor: cores.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  xpCardInner: {
    padding: 22,
    // Gradiente simulado via background
    backgroundColor: cores.accentGradientStart,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  xpNivelLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  xpTitulo: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  xpValor: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  xpNumero: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  xpSufixo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '700',
  },
  xpBarContainer: {
    gap: 8,
  },
  xpBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: cores.xpBarBg,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: cores.xpGold,
  },
  xpFaltando: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },

  // ─── Seção ───
  secaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  secaoTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: cores.textPrimary,
  },
  secaoLink: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.discoverBlue,
  },

  // ─── Missões ───
  missoesContainer: {
    backgroundColor: cores.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: cores.cardBorder,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  missaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: cores.cardBorder,
  },
  missaoIcone: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: cores.missionIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  missaoIconeConcluida: {
    backgroundColor: cores.successBg,
  },
  missaoTextos: {
    flex: 1,
    marginRight: 8,
  },
  missaoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.textPrimary,
    marginBottom: 3,
  },
  missaoTituloConcluida: {
    textDecorationLine: 'line-through',
    color: cores.textMuted,
  },
  missaoDescricao: {
    fontSize: 12,
    color: cores.textSecondary,
  },
  missaoXp: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.xpGold,
  },
  missaoFeito: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.success,
  },

  // ─── Descubra ───
  progressoColetas: {
    height: 6,
    borderRadius: 3,
    backgroundColor: cores.cardBorder,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressoColetasPreenchido: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: cores.success,
  },
  todosColetados: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  filtros: {
    gap: 8,
    paddingBottom: 14,
  },
  filtro: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: cores.card,
    borderWidth: 1,
    borderColor: cores.cardBorder,
  },
  filtroAtivo: {
    backgroundColor: cores.accent,
    borderColor: cores.accent,
  },
  filtroTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.textSecondary,
  },
  filtroTextoAtivo: {
    color: '#FFFFFF',
  },
  descubraLista: {
    gap: DISCOVER_GAP,
    paddingRight: 20,
  },
  xpVerNiveis: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  xpVerNiveisTexto: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  niveisIntro: {
    fontSize: 13,
    lineHeight: 19,
    color: cores.textSecondary,
    marginBottom: 14,
  },
  nivelLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  nivelLinhaAtual: {
    backgroundColor: cores.destaqueSuave,
  },
  nivelNumero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: cores.background,
    borderWidth: 1,
    borderColor: cores.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nivelNumeroAlcancado: {
    backgroundColor: cores.accent,
    borderColor: cores.accent,
  },
  nivelNumeroTexto: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.textMuted,
  },
  nivelTextos: {
    flex: 1,
  },
  nivelTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.textPrimary,
  },
  nivelBloqueado: {
    color: cores.textSecondary,
  },
  nivelDescricao: {
    fontSize: 12,
    color: cores.textSecondary,
    marginTop: 2,
  },
  nivelPontos: {
    fontSize: 12,
    fontWeight: '700',
    color: cores.textMuted,
  },
  descubraCard: {
    width: DISCOVER_CARD_WIDTH,
    height: 180,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  descubraTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  descubraChip: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  descubraNome: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  descubraDescricao: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  descubraRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  descubraLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
