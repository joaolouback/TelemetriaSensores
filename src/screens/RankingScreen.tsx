/**
 * Tela de Ranking / Leaderboard — UVV Go
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { HOME_COLORS } from '../constants';

const RANKING_MOCK = [
  { posicao: 1, nome: 'Lucas Silva', xp: 8450, nivel: 9, avatar: 'LS', destaque: false },
  { posicao: 2, nome: 'Mariana Costa', xp: 7200, nivel: 8, avatar: 'MC', destaque: false },
  { posicao: 3, nome: 'Pedro Henrique', xp: 6100, nivel: 7, avatar: 'PH', destaque: false },
  { posicao: 4, nome: 'Arthur (Você)', xp: 4200, nivel: 5, avatar: 'AR', destaque: true },
  { posicao: 5, nome: 'Beatriz Lima', xp: 3950, nivel: 5, avatar: 'BL', destaque: false },
  { posicao: 6, nome: 'Gabriel Rocha', xp: 3100, nivel: 4, avatar: 'GR', destaque: false },
  { posicao: 7, nome: 'Camila Santos', xp: 2800, nivel: 4, avatar: 'CS', destaque: false },
  { posicao: 8, nome: 'Rafael Oliveira', xp: 2300, nivel: 3, avatar: 'RO', destaque: false },
];

export function RankingScreen() {
  const top3 = RANKING_MOCK.slice(0, 3);
  const resto = RANKING_MOCK.slice(3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={HOME_COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Ranking do Campus 🏆</Text>
        <Text style={styles.headerSubtitulo}>Os maiores exploradores da UVV</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Podium Top 3 */}
        <View style={styles.podiumContainer}>
          {/* #2 */}
          <View style={[styles.podiumItem, styles.podium2]}>
            <View style={styles.avatar2}>
              <Text style={styles.avatarTexto}>{top3[1].avatar}</Text>
            </View>
            <Text style={styles.podiumPosicao}>2º</Text>
            <Text style={styles.podiumNome} numberOfLines={1}>{top3[1].nome}</Text>
            <Text style={styles.podiumXp}>{top3[1].xp} XP</Text>
          </View>

          {/* #1 */}
          <View style={[styles.podiumItem, styles.podium1]}>
            <Text style={styles.coroa}>👑</Text>
            <View style={styles.avatar1}>
              <Text style={styles.avatarTexto}>{top3[0].avatar}</Text>
            </View>
            <Text style={styles.podiumPosicao1}>1º</Text>
            <Text style={styles.podiumNome1} numberOfLines={1}>{top3[0].nome}</Text>
            <Text style={styles.podiumXp1}>{top3[0].xp} XP</Text>
          </View>

          {/* #3 */}
          <View style={[styles.podiumItem, styles.podium3]}>
            <View style={styles.avatar3}>
              <Text style={styles.avatarTexto}>{top3[2].avatar}</Text>
            </View>
            <Text style={styles.podiumPosicao}>3º</Text>
            <Text style={styles.podiumNome} numberOfLines={1}>{top3[2].nome}</Text>
            <Text style={styles.podiumXp}>{top3[2].xp} XP</Text>
          </View>
        </View>

        {/* Lista do restante */}
        <View style={styles.listaCard}>
          {resto.map((user) => (
            <View
              key={user.posicao}
              style={[
                styles.itemLinha,
                user.destaque && styles.itemDestaque,
              ]}
            >
              <Text style={[styles.posicaoTexto, user.destaque && styles.posicaoDestaque]}>
                #{user.posicao}
              </Text>

              <View style={[styles.miniAvatar, user.destaque && styles.miniAvatarDestaque]}>
                <Text style={styles.miniAvatarTexto}>{user.avatar}</Text>
              </View>

              <View style={styles.itemInfo}>
                <Text style={[styles.itemNome, user.destaque && styles.itemNomeDestaque]}>
                  {user.nome}
                </Text>
                <Text style={styles.itemNivel}>Nível {user.nivel}</Text>
              </View>

              <Text style={[styles.itemXp, user.destaque && styles.itemXpDestaque]}>
                {user.xp.toLocaleString('pt-BR')} XP
              </Text>
            </View>
          ))}
        </View>

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
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: HOME_COLORS.background,
  },
  headerTitulo: {
    fontSize: 26,
    fontWeight: '800',
    color: HOME_COLORS.textPrimary,
  },
  headerSubtitulo: {
    fontSize: 14,
    color: HOME_COLORS.textSecondary,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 20,
    gap: 12,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: HOME_COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: HOME_COLORS.cardBorder,
  },
  podium1: {
    borderColor: HOME_COLORS.xpGold,
    backgroundColor: '#FFFDF5',
    elevation: 4,
    paddingVertical: 18,
  },
  podium2: {
    borderColor: '#CBD5E1',
  },
  podium3: {
    borderColor: '#FDBA74',
  },
  coroa: {
    fontSize: 22,
    marginBottom: 4,
  },
  avatar1: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: HOME_COLORS.xpGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatar2: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatar3: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  podiumPosicao1: {
    fontSize: 16,
    fontWeight: '800',
    color: HOME_COLORS.xpGold,
  },
  podiumPosicao: {
    fontSize: 14,
    fontWeight: '700',
    color: HOME_COLORS.textSecondary,
  },
  podiumNome1: {
    fontSize: 14,
    fontWeight: '800',
    color: HOME_COLORS.textPrimary,
    marginTop: 2,
  },
  podiumNome: {
    fontSize: 12,
    fontWeight: '700',
    color: HOME_COLORS.textPrimary,
    marginTop: 2,
  },
  podiumXp1: {
    fontSize: 13,
    fontWeight: '800',
    color: HOME_COLORS.xpGold,
    marginTop: 4,
  },
  podiumXp: {
    fontSize: 11,
    fontWeight: '600',
    color: HOME_COLORS.textSecondary,
    marginTop: 4,
  },
  listaCard: {
    backgroundColor: HOME_COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: HOME_COLORS.cardBorder,
    overflow: 'hidden',
  },
  itemLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: HOME_COLORS.cardBorder,
  },
  itemDestaque: {
    backgroundColor: '#EEF2FF',
  },
  posicaoTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: HOME_COLORS.textMuted,
    width: 32,
  },
  posicaoDestaque: {
    color: HOME_COLORS.discoverBlue,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  miniAvatarDestaque: {
    backgroundColor: HOME_COLORS.discoverBlue,
  },
  miniAvatarTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 14,
    fontWeight: '700',
    color: HOME_COLORS.textPrimary,
  },
  itemNomeDestaque: {
    color: HOME_COLORS.discoverBlue,
  },
  itemNivel: {
    fontSize: 12,
    color: HOME_COLORS.textSecondary,
  },
  itemXp: {
    fontSize: 14,
    fontWeight: '700',
    color: HOME_COLORS.textPrimary,
  },
  itemXpDestaque: {
    color: HOME_COLORS.discoverBlue,
  },
});
