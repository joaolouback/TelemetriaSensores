/**
 * Tela de Perfil do Usuário — UVV Go
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { HOME_COLORS, USER_MOCK } from '../constants';

const CONQUISTAS_MOCK = [
  { id: 1, titulo: 'Primeiro Passo', desc: 'Fez check-in no mapa', icone: '📍' },
  { id: 2, titulo: 'Explorador UVV', desc: 'Visitou 5 pontos do campus', icone: '🎒' },
  { id: 3, titulo: 'Mestre da Telemetria', desc: 'Coletou 100 registros', icone: '📊' },
  { id: 4, titulo: 'Inovador', desc: 'Passou pelo Prédio Inova', icone: '💡' },
];

export function ProfileScreen() {
  const user = USER_MOCK;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={HOME_COLORS.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Perfil */}
        <View style={styles.header}>
          <View style={styles.avatarGrande}>
            <Text style={styles.avatarTexto}>{user.iniciais}</Text>
          </View>
          <Text style={styles.nome}>{user.nome}</Text>
          <Text style={styles.titulo}>{user.titulo} · Nível {user.nivel}</Text>
          <Text style={styles.email}>arthur@aluno.uvv.br</Text>
        </View>

        {/* ESTATÍSTICAS */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValor}>{user.xpAtual.toLocaleString('pt-BR')}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValor}>12</Text>
            <Text style={styles.statLabel}>Locais Visitados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValor}>4</Text>
            <Text style={styles.statLabel}>Conquistas</Text>
          </View>
        </View>

        {/* SEÇÃO CONQUISTAS */}
        <Text style={styles.secaoTitulo}>Conquistas</Text>

        <View style={styles.conquistasGrid}>
          {CONQUISTAS_MOCK.map((c) => (
            <View key={c.id} style={styles.conquistaCard}>
              <Text style={styles.conquistaIcone}>{c.icone}</Text>
              <Text style={styles.conquistaTitulo}>{c.titulo}</Text>
              <Text style={styles.conquistaDesc}>{c.desc}</Text>
            </View>
          ))}
        </View>

        {/* OPÇÕES */}
        <View style={styles.opcoesContainer}>
          <TouchableOpacity style={styles.opcaoItem} activeOpacity={0.7}>
            <Text style={styles.opcaoTexto}>⚙️ Configurações da Conta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.opcaoItem} activeOpacity={0.7}>
            <Text style={styles.opcaoTexto}>🔔 Notificações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.opcaoItem, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
            <Text style={[styles.opcaoTexto, { color: '#EF4444' }]}>🚪 Sair da Conta</Text>
          </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 20,
  },
  avatarGrande: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: HOME_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: HOME_COLORS.accentLight,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  nome: {
    fontSize: 24,
    fontWeight: '800',
    color: HOME_COLORS.textPrimary,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: HOME_COLORS.discoverBlue,
    marginTop: 4,
  },
  email: {
    fontSize: 13,
    color: HOME_COLORS.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: HOME_COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: HOME_COLORS.cardBorder,
    marginBottom: 24,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: HOME_COLORS.cardBorder,
  },
  statValor: {
    fontSize: 18,
    fontWeight: '800',
    color: HOME_COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: HOME_COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  secaoTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: HOME_COLORS.textPrimary,
    marginBottom: 14,
  },
  conquistasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  conquistaCard: {
    width: '48%',
    backgroundColor: HOME_COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: HOME_COLORS.cardBorder,
  },
  conquistaIcone: {
    fontSize: 28,
    marginBottom: 8,
  },
  conquistaTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: HOME_COLORS.textPrimary,
  },
  conquistaDesc: {
    fontSize: 11,
    color: HOME_COLORS.textSecondary,
    marginTop: 2,
  },
  opcoesContainer: {
    backgroundColor: HOME_COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: HOME_COLORS.cardBorder,
    overflow: 'hidden',
  },
  opcaoItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: HOME_COLORS.cardBorder,
  },
  opcaoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: HOME_COLORS.textPrimary,
  },
});
