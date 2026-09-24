/**
 * Tela Inicial gamificada — UVV Go
 *
 * Layout inspirado em apps gamificados, com saudação, card de nível/XP,
 * missões diárias e seção "Descubra" com locais do campus.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  HOME_COLORS,
  USER_MOCK,
  MISSOES_MOCK,
  DESCUBRA_MOCK,
} from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { obterIniciais } from '../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DISCOVER_CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2; // padding + gap

function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HomeScreen() {
  const { usuario } = useAuth();
  // Nível/XP ainda são mock; nome e iniciais vêm do usuário logado.
  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0] ?? USER_MOCK.nome;
  const user = {
    ...USER_MOCK,
    nome: primeiroNome,
    iniciais: usuario ? obterIniciais(usuario.nome) : USER_MOCK.iniciais,
  };
  const xpProgresso = user.xpAtual / user.xpProximoNivel;
  const xpFaltando = user.xpProximoNivel - user.xpAtual;

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
                <Text style={styles.xpNivelLabel}>Nível {user.nivel}</Text>
                <Text style={styles.xpTitulo}>{user.titulo}</Text>
              </View>
              <View style={styles.xpValor}>
                <Text style={styles.xpNumero}>
                  {user.xpAtual.toLocaleString('pt-BR')}
                </Text>
                <Text style={styles.xpSufixo}> XP</Text>
              </View>
            </View>

            {/* Barra de progresso */}
            <View style={styles.xpBarContainer}>
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, { width: `${xpProgresso * 100}%` }]} />
              </View>
              <Text style={styles.xpFaltando}>
                Faltam {xpFaltando.toLocaleString('pt-BR')} XP para o Nível {user.nivel + 1}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Missões Diárias ─── */}
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoTitulo}>Missões Diárias</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.secaoLink}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.missoesContainer}>
          {MISSOES_MOCK.map((missao) => (
            <View key={missao.id} style={styles.missaoCard}>
              <View style={[
                styles.missaoIcone,
                missao.concluida && styles.missaoIconeConcluida,
              ]}>
                <Text style={styles.missaoIconeTexto}>{missao.icone}</Text>
              </View>
              <View style={styles.missaoTextos}>
                <Text
                  style={[
                    styles.missaoTitulo,
                    missao.concluida && styles.missaoTituloConcluida,
                  ]}
                >
                  {missao.titulo}
                </Text>
                <Text style={styles.missaoDescricao}>{missao.descricao}</Text>
              </View>
              {missao.concluida ? (
                <Text style={styles.missaoFeito}>Feito</Text>
              ) : (
                <Text style={styles.missaoXp}>+{missao.xp} XP</Text>
              )}
            </View>
          ))}
        </View>

        {/* ─── Descubra ─── */}
        <Text style={[styles.secaoTitulo, { marginTop: 28, marginBottom: 14 }]}>
          Descubra
        </Text>

        <View style={styles.descubraGrid}>
          {DESCUBRA_MOCK.map((local) => (
            <TouchableOpacity
              key={local.id}
              style={[styles.descubraCard, { backgroundColor: local.cor }]}
              activeOpacity={0.85}
            >
              <Text style={styles.descubraNome}>{local.nome}</Text>
              <View style={styles.descubraBottom}>
                <Text style={styles.descubraLabel}>{local.nome}</Text>
                <Text style={styles.descubraDistancia}>📍 {local.distancia}</Text>
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
