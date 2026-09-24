/**
 * Estrutura visual compartilhada pelas telas de Login e Registro:
 * cabeçalho com a marca UVV Go, cartão branco com o formulário e
 * indicador de que a coleta de sensores já está rodando.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HOME_COLORS } from '../constants';
import { useTelemetria } from '../contexts/TelemetriaContext';
import { CollectionStatus } from '../types';

interface AuthLayoutProps {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  /** Mensagem de erro geral (ex.: resposta da API). */
  erro?: string | null;
  botao: { rotulo: string; onPress: () => void; carregando: boolean };
  rodape: { texto: string; link: string; onPress: () => void };
}

export function AuthLayout({ titulo, subtitulo, children, erro, botao, rodape }: AuthLayoutProps) {
  const { status } = useTelemetria();
  const coletando = status === CollectionStatus.COLLECTING;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={HOME_COLORS.accent} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons name="location" size={30} color={HOME_COLORS.xpGold} />
          </View>
          <Text style={styles.marca}>UVV Go</Text>
          <Text style={styles.slogan}>Explore o campus, desbloqueie conquistas</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.subtitulo}>{subtitulo}</Text>

          {!!erro && (
            <View style={styles.alerta} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={18} color="#B91C1C" />
              <Text style={styles.alertaTexto}>{erro}</Text>
            </View>
          )}

          {children}

          <TouchableOpacity
            style={[styles.botao, botao.carregando && styles.botaoDesabilitado]}
            onPress={botao.onPress}
            disabled={botao.carregando}
            activeOpacity={0.85}
          >
            {botao.carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botaoTexto}>{botao.rotulo}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>{rodape.texto} </Text>
            <TouchableOpacity onPress={rodape.onPress} disabled={botao.carregando}>
              <Text style={styles.rodapeLink}>{rodape.link}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.coleta}>
          <View style={[styles.coletaPonto, coletando && styles.coletaPontoAtivo]} />
          <Text style={styles.coletaTexto}>
            {coletando
              ? 'Coleta de sensores ativa · dados salvos no aparelho'
              : 'Preparando coleta de sensores...'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: HOME_COLORS.accent,
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 72,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  marca: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  slogan: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    backgroundColor: HOME_COLORS.card,
    marginHorizontal: 20,
    marginTop: -44,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: HOME_COLORS.cardBorder,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: HOME_COLORS.textPrimary,
  },
  subtitulo: {
    fontSize: 14,
    color: HOME_COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  alerta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  alertaTexto: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  botao: {
    height: 52,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  rodapeTexto: {
    fontSize: 14,
    color: HOME_COLORS.textSecondary,
  },
  rodapeLink: {
    fontSize: 14,
    fontWeight: '800',
    color: HOME_COLORS.discoverBlue,
  },
  coleta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  coletaPonto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HOME_COLORS.textMuted,
  },
  coletaPontoAtivo: {
    backgroundColor: HOME_COLORS.success,
  },
  coletaTexto: {
    fontSize: 12,
    color: HOME_COLORS.textSecondary,
    fontWeight: '500',
  },
});
