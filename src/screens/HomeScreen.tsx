/**
 * Tela Inicial gamificada — UVV Go
 *
 * Layout inspirado em apps gamificados, com saudação, card de nível/XP,
 * próximas coletas e seção "Descubra" com os pontos do campus — tudo com
 * os dados reais da API (pontuação, pontos e o que já foi coletado).
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { HOME_COLORS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { usePontos } from '../hooks/usePontos';
import { useColetas } from '../hooks/useColetas';
import { obterIniciais } from '../utils';
import { calcularNivel } from '../utils/nivel';
import { CardDesafio } from '../components/CardDesafio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DISCOVER_CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2; // padding + gap
const CORES_DESCUBRA = ['#3B5BDB', '#7C3AED', '#059669', '#D97706'];
const MAX_PROXIMAS_COLETAS = 3;

function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HomeScreen() {
  const { usuario } = useAuth();
  const { pontos } = usePontos(null);
  const { coletados } = useColetas();

  const pontuacao = usuario?.pontuacaoTotal ?? 0;
  const nivel = calcularNivel(pontuacao);
  const user = {
    nome: usuario?.nome.trim().split(/\s+/)[0] ?? '',
    iniciais: usuario ? obterIniciais(usuario.nome) : '',
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={HOME_COLORS.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header / Saudação ─── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>{getSaudacao()},</Text>
            <Text style={styles.nome}>{user.nome}! 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{user.iniciais}</Text>
          </View>
        </View>

        {/* ─── Card Nível / XP ─── */}
        <View style={styles.xpCard}>
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
          </View>
        </View>

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

        <View style={styles.missoesContainer}>
          {proximasColetas.map((ponto) => {
            const concluida = coletados.has(ponto.id);
            return (
              <View key={ponto.id} style={styles.missaoCard}>
                <View style={[styles.missaoIcone, concluida && styles.missaoIconeConcluida]}>
                  <Text style={styles.missaoIconeTexto}>{concluida ? '✅' : '💎'}</Text>
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
              </View>
            );
          })}
          {pontos.length === 0 && (
            <Text style={styles.missaoDescricao}>Carregando os pontos do campus...</Text>
          )}
        </View>

        {/* ─── Descubra ─── */}
        <Text style={[styles.secaoTitulo, { marginTop: 28, marginBottom: 14 }]}>
          Descubra
        </Text>

        <View style={styles.descubraGrid}>
          {pontosOrdenados.slice(MAX_PROXIMAS_COLETAS, MAX_PROXIMAS_COLETAS + 4).map((ponto, i) => (
            <TouchableOpacity
              key={ponto.id}
              style={[styles.descubraCard, { backgroundColor: CORES_DESCUBRA[i % CORES_DESCUBRA.length] }]}
              activeOpacity={0.85}
            >
              <Text style={styles.descubraNome}>{ponto.nome}</Text>
              <View style={styles.descubraBottom}>
                <Text style={styles.descubraLabel}>
                  {coletados.has(ponto.id) ? '✓ Coletado' : 'Cristal disponível'}
                </Text>
                <Text style={styles.descubraDistancia}>⭐ {ponto.pontosRecompensa} pts</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Espaço para o bottom tab */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
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
    paddingTop: 56,
    paddingBottom: 20,
  },
  saudacao: {
    fontSize: 15,
    color: HOME_COLORS.textSecondary,
    fontWeight: '500',
  },
  nome: {
    fontSize: 28,
    fontWeight: '800',
    color: HOME_COLORS.textPrimary,
    marginTop: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HOME_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: HOME_COLORS.accentLight,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // ─── XP Card ───
  xpCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
    // Simula gradiente com fundo sólido + overlay
    backgroundColor: HOME_COLORS.accent,
    elevation: 8,
    shadowColor: HOME_COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  xpCardInner: {
    padding: 22,
    // Gradiente simulado via background
    backgroundColor: HOME_COLORS.accentGradientStart,
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
    backgroundColor: HOME_COLORS.xpBarBg,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: HOME_COLORS.xpGold,
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
    color: HOME_COLORS.textPrimary,
  },
  secaoLink: {
    fontSize: 14,
    fontWeight: '600',
    color: HOME_COLORS.discoverBlue,
  },

  // ─── Missões ───
  missoesContainer: {
    backgroundColor: HOME_COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: HOME_COLORS.cardBorder,
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
    borderBottomColor: HOME_COLORS.cardBorder,
  },
  missaoIcone: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.missionIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  missaoIconeConcluida: {
    backgroundColor: HOME_COLORS.successBg,
  },
  missaoIconeTexto: {
    fontSize: 20,
  },
  missaoTextos: {
    flex: 1,
    marginRight: 8,
  },
  missaoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: HOME_COLORS.textPrimary,
    marginBottom: 3,
  },
  missaoTituloConcluida: {
    textDecorationLine: 'line-through',
    color: HOME_COLORS.textMuted,
  },
  missaoDescricao: {
    fontSize: 12,
    color: HOME_COLORS.textSecondary,
  },
  missaoXp: {
    fontSize: 14,
    fontWeight: '800',
    color: HOME_COLORS.xpGold,
  },
  missaoFeito: {
    fontSize: 14,
    fontWeight: '700',
    color: HOME_COLORS.success,
  },

  // ─── Descubra ───
  descubraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  descubraCard: {
    width: DISCOVER_CARD_WIDTH,
    height: 140,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  descubraNome: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 20,
    fontWeight: '800',
  },
  descubraBottom: {
    gap: 2,
  },
  descubraLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  descubraDistancia: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '500',
  },
});
