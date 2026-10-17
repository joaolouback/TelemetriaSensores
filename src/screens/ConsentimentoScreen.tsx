/**
 * Consentimento da coleta de telemetria (LGPD).
 *
 * Exibida na primeira abertura, antes do login. Explica o que é coletado,
 * para quê e como desligar. Recusar não impede o jogo: só a telemetria
 * de pesquisa fica desligada.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HOME_COLORS } from '../constants';
import { useTelemetria } from '../contexts/TelemetriaContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITENS = [
  { icone: 'location' as const, titulo: 'Localização (GPS)', texto: 'A cada 30 segundos, enquanto o app está aberto.' },
  { icone: 'phone-portrait' as const, titulo: 'Movimento do aparelho', texto: 'Leituras do acelerômetro.' },
  { icone: 'battery-half' as const, titulo: 'Bateria e rede', texto: 'Nível de bateria e tipo de conexão (Wi-Fi ou dados).' },
];

export function ConsentimentoScreen() {
  const insets = useSafeAreaInsets();
  const { definirConsentimento } = useTelemetria();
  const [salvando, setSalvando] = useState<'sim' | 'nao' | null>(null);

  const responder = async (aceito: boolean) => {
    setSalvando(aceito ? 'sim' : 'nao');
    try {
      await definirConsentimento(aceito);
    } finally {
      setSalvando(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={HOME_COLORS.accent} />

      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
          <Ionicons name="shield-checkmark" size={44} color="#FFFFFF" style={styles.heroIcone} />
          <Text style={styles.heroTitulo} accessibilityRole="header">
            Sua privacidade
          </Text>
          <Text style={styles.heroTexto}>
            O UVV Go faz parte de um Trabalho de Conclusão de Curso. Com a sua permissão, o app
            registra dados dos sensores para avaliar o desempenho do jogo no campus.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.secao}>O que é coletado</Text>
          {ITENS.map((item) => (
            <View key={item.titulo} style={styles.item}>
              <Ionicons name={item.icone} size={22} color={HOME_COLORS.discoverBlue} style={styles.itemIcone} />
              <View style={styles.itemTextos}>
                <Text style={styles.itemTitulo}>{item.titulo}</Text>
                <Text style={styles.itemTexto}>{item.texto}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.secao}>Como os dados são usados</Text>
          <Text style={styles.paragrafo}>
            Os registros ficam primeiro no seu celular e depois são enviados ao servidor do projeto.
            Depois do login, ficam associados à sua conta. São usados apenas na pesquisa do TCC e
            não são compartilhados com terceiros.
          </Text>

          <Text style={styles.secao}>Você decide</Text>
          <Text style={styles.paragrafo}>
            Recusar não muda nada no jogo: mapa, câmera AR e pontuação funcionam igual. Você pode
            mudar de ideia a qualquer momento no Perfil — ao desligar, o que ainda não foi enviado
            é apagado do aparelho.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botaoAceitar}
          onPress={() => responder(true)}
          disabled={salvando !== null}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          {salvando === 'sim' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botaoAceitarTexto}>Aceitar e continuar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoRecusar}
          onPress={() => responder(false)}
          disabled={salvando !== null}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          {salvando === 'nao' ? (
            <ActivityIndicator color={HOME_COLORS.textSecondary} />
          ) : (
            <Text style={styles.botaoRecusarTexto}>Continuar sem compartilhar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },
  conteudo: {
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: HOME_COLORS.accent,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroIcone: {
    marginBottom: 8,
  },
  heroTitulo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroTexto: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: HOME_COLORS.card,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: HOME_COLORS.cardBorder,
    elevation: 3,
  },
  secao: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemIcone: {
    width: 32,
  },
  itemTextos: {
    flex: 1,
  },
  itemTitulo: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  itemTexto: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    marginTop: 1,
  },
  paragrafo: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  botaoAceitar: {
    backgroundColor: HOME_COLORS.accent,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  botaoAceitarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  botaoRecusar: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoRecusarTexto: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
