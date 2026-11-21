/**
 * Card do local, exibido depois de coletar o cristal em AR.
 *
 * Transforma a coleta num pequeno tour pelo campus: mostra a foto, a descrição
 * e a curiosidade do ponto (cadastradas no seed da API), além dos pontos
 * ganhos, das conquistas e do progresso no desafio 1x1.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PontoDeInteresse, ResultadoCheckin } from '../types';
import { urlDoServidor } from '../utils/url';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';

interface Props {
  ponto: PontoDeInteresse;
  resultado: ResultadoCheckin;
  onFechar: () => void;
}

export function CardLocal({ ponto, resultado, onFechar }: Props) {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
  const { desafio } = resultado;
  const venceu = desafio?.resultado === 'vitoria';

  // Entrada com "pulo": o card surge crescendo, como uma recompensa.
  const entrada = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(entrada, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
  }, [entrada]);
  const animacao = {
    opacity: entrada,
    transform: [{ scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
  };

  return (
    <Animated.View style={[styles.cartao, animacao]}>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {ponto.imagemUrl ? (
          <Image source={{ uri: urlDoServidor(ponto.imagemUrl) }} style={styles.foto} resizeMode="cover" />
        ) : null}

        <Text style={styles.rotulo}>Você descobriu</Text>
        <Text style={styles.titulo}>{ponto.nome}</Text>

        <View style={styles.selos}>
          {resultado.pontosGanhos > 0 ? (
            <Text style={[styles.selo, styles.seloPontos]}>+{resultado.pontosGanhos} pontos</Text>
          ) : (
            <Text style={[styles.selo, styles.seloNeutro]}>Já coletado antes</Text>
          )}
          <Text style={[styles.selo, styles.seloNeutro]}>Total: {resultado.pontuacaoTotal}</Text>
        </View>

        {desafio && (
          <View style={[styles.linhaIcone, styles.desafio, venceu && styles.desafioVitoria]}>
            <Ionicons name={venceu ? 'trophy' : 'flash'} size={18} color={venceu ? cores.avisoTexto : cores.accent} />
            <Text style={styles.desafioTexto}>
              {venceu
                ? `Você venceu o desafio! +${desafio.bonus} pontos de bônus`
                : `Desafio: ${desafio.coletados} de ${desafio.total} pontos coletados`}
            </Text>
          </View>
        )}

        {resultado.novasConquistas.map((c) => (
          <View key={c.id} style={[styles.linhaIcone, styles.conquista]}>
            <Ionicons name="ribbon" size={18} color={cores.xpGold} />
            <Text style={styles.conquistaTexto}>Conquista desbloqueada: {c.titulo}</Text>
          </View>
        ))}

        {ponto.descricao ? <Text style={styles.descricao}>{ponto.descricao}</Text> : null}

        {ponto.curiosidade ? (
          <View style={styles.curiosidade}>
            <View style={styles.linhaIcone}>
              <Ionicons name="bulb" size={16} color={cores.xpGold} />
              <Text style={styles.curiosidadeRotulo}>Você sabia?</Text>
            </View>
            <Text style={styles.curiosidadeTexto}>{ponto.curiosidade}</Text>
          </View>
        ) : null}
      </ScrollView>

      <TouchableOpacity style={styles.botao} onPress={onFechar} activeOpacity={0.85} accessibilityRole="button">
        <Text style={styles.botaoTexto}>Voltar ao mapa</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const criarEstilos = (cores: Tema) => StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficieTranslucida,
    borderRadius: 18,
    padding: 16,
    maxHeight: 520,
    borderWidth: 2,
    borderColor: cores.success,
    elevation: 10,
  },
  conteudo: {
    paddingBottom: 4,
  },
  foto: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: cores.cardBorder,
  },
  rotulo: {
    color: cores.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  titulo: {
    color: cores.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  selos: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  selo: {
    fontSize: 13,
    fontWeight: '800',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  seloPontos: {
    color: cores.successText,
    backgroundColor: cores.successBg,
  },
  seloNeutro: {
    color: cores.textSecondary,
    backgroundColor: cores.background,
  },
  linhaIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desafio: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: cores.missionIconBg,
  },
  desafioVitoria: {
    backgroundColor: cores.avisoFundo,
  },
  desafioTexto: {
    flex: 1,
    color: cores.accent,
    fontSize: 14,
    fontWeight: '800',
  },
  conquista: {
    marginTop: 10,
  },
  conquistaTexto: {
    flex: 1,
    color: cores.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  descricao: {
    color: cores.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  curiosidade: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: cores.background,
    borderLeftWidth: 4,
    borderLeftColor: cores.xpGold,
  },
  curiosidadeRotulo: {
    color: cores.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  curiosidadeTexto: {
    marginTop: 4,
    color: cores.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  botao: {
    backgroundColor: cores.discoverBlue,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 12,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
  },
});
