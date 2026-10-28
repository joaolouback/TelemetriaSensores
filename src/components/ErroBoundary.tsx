/**
 * Captura erros de renderização em qualquer tela e mostra uma tela de recuperação,
 * em vez de o app inteiro ficar em branco. "Tentar de novo" remonta os filhos.
 *
 * Precisa ser componente de classe: o React só oferece `componentDidCatch` assim.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HOME_COLORS } from '../constants';

interface State {
  erro: Error | null;
}

export class ErroBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { erro: null };

  static getDerivedStateFromError(erro: Error): State {
    return { erro };
  }

  componentDidCatch(erro: Error, info: React.ErrorInfo) {
    console.error('[ErroBoundary] Erro de renderização:', erro, info.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;

    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={56} color={HOME_COLORS.textMuted} />
        <Text style={styles.titulo}>Algo deu errado</Text>
        <Text style={styles.texto}>
          Uma parte do app encontrou um problema. Seus dados estão salvos — tente de novo.
        </Text>
        {__DEV__ && <Text style={styles.detalhe}>{this.state.erro.message}</Text>}
        <TouchableOpacity
          style={styles.botao}
          onPress={() => this.setState({ erro: null })}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.botaoTexto}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: HOME_COLORS.background,
  },
  titulo: {
    color: HOME_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },
  texto: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  detalhe: {
    color: '#B91C1C',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  botao: {
    backgroundColor: HOME_COLORS.accent,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 28,
    marginTop: 24,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
