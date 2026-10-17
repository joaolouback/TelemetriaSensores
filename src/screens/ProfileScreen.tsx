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
  Alert,
  Switch,
} from 'react-native';
import { HOME_COLORS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useTelemetria } from '../contexts/TelemetriaContext';
import { obterIniciais } from '../utils';
import { calcularNivel } from '../utils/nivel';
import { useColetas } from '../hooks/useColetas';

const CONQUISTAS_MOCK = [
  { id: 1, titulo: 'Primeiro Passo', desc: 'Fez check-in no mapa', icone: '📍' },
  { id: 2, titulo: 'Explorador UVV', desc: 'Visitou 5 pontos do campus', icone: '🎒' },
  { id: 3, titulo: 'Mestre da Telemetria', desc: 'Coletou 100 registros', icone: '📊' },
  { id: 4, titulo: 'Inovador', desc: 'Passou pelo Prédio Inova', icone: '💡' },
];

export function ProfileScreen() {
  const { usuario, sair } = useAuth();
  const { consentimento, definirConsentimento } = useTelemetria();
  const { coletados } = useColetas();
  // Pontuação, nível e locais são reais; a lista de conquistas ainda é mock.
  const pontuacao = usuario?.pontuacaoTotal ?? 0;
  const nivel = calcularNivel(pontuacao);
  const user = {
    nome: usuario?.nome ?? '',
    iniciais: usuario ? obterIniciais(usuario.nome) : '',
  };

  const alternarTelemetria = (ligar: boolean) => {
    if (ligar) {
      definirConsentimento(true).catch(console.error);
      return;
    }
    Alert.alert(
      'Parar de compartilhar?',
      'A coleta será desligada e os registros que ainda não foram enviados serão apagados do aparelho.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desligar', style: 'destructive', onPress: () => definirConsentimento(false).catch(console.error) },
      ]
    );
  };

  const confirmarSaida = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => sair() },
    ]);
  };

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
          <Text style={styles.titulo}>{nivel.titulo} · Nível {nivel.nivel}</Text>
          <Text style={styles.email}>{usuario?.email}</Text>
        </View>

        {/* ESTATÍSTICAS */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValor}>{pontuacao.toLocaleString('pt-BR')}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValor}>{coletados.size}</Text>
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
          <View style={[styles.opcaoItem, styles.opcaoLinha]}>
            <View style={styles.opcaoTextos}>
              <Text style={styles.opcaoTexto}>🔒 Compartilhar telemetria</Text>
              <Text style={styles.opcaoDescricao}>
                GPS, movimento e bateria para a pesquisa do TCC
              </Text>
            </View>
            <Switch
              value={consentimento === true}
              onValueChange={alternarTelemetria}
              trackColor={{ true: HOME_COLORS.discoverBlue, false: HOME_COLORS.cardBorder }}
              thumbColor="#FFFFFF"
            />
          </View>
          <TouchableOpacity style={styles.opcaoItem} activeOpacity={0.7}>
            <Text style={styles.opcaoTexto}>⚙️ Configurações da Conta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.opcaoItem} activeOpacity={0.7}>
            <Text style={styles.opcaoTexto}>🔔 Notificações</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.opcaoItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={confirmarSaida}
          >
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
  opcaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opcaoTextos: {
    flex: 1,
    marginRight: 12,
  },
  opcaoDescricao: {
    fontSize: 12,
    color: HOME_COLORS.textSecondary,
    marginTop: 2,
  },
});
