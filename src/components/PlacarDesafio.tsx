/**
 * Placar compacto do desafio em andamento, exibido sobre o mapa:
 * "Você 1/3 × 2/3 Bruno · 42:10".
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Desafio } from '../types';
import { useTempoRestante } from '../hooks/useTempoRestante';

/** Cor dos pontos do desafio no mapa (e do placar). */
export const COR_DESAFIO = '#F97316';

interface Props {
  desafio: Desafio;
  ajusteRelogio: number;
}

export function PlacarDesafio({ desafio, ajusteRelogio }: Props) {
  const { texto, restanteMs } = useTempoRestante(desafio.terminaEm, ajusteRelogio);
  const total = desafio.pontos.length;
  const nomeOponente = desafio.oponente?.nome.trim().split(/\s+/)[0] ?? 'Oponente';

  const meus = desafio.eu.coletados.length;
  const dele = desafio.oponente?.coletados.length ?? 0;
  const acabando = restanteMs < 5 * 60 * 1000;

  return (
    <View
      style={styles.placar}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Desafio: você ${meus} de ${total}, ${nomeOponente} ${dele} de ${total}. Tempo restante ${texto}`}
    >
      <Ionicons name="flash" size={16} color="#FFFFFF" />
      <Text style={styles.texto} numberOfLines={1}>
        Você {meus}/{total} × {dele}/{total} {nomeOponente}
      </Text>
      <Ionicons name="timer-outline" size={16} color={acabando ? '#FEF08A' : '#FFFFFF'} />
      <Text style={[styles.tempo, acabando && styles.tempoAcabando]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COR_DESAFIO,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    elevation: 6,
  },
  texto: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    marginRight: 4,
  },
  tempo: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  tempoAcabando: {
    color: '#FEF08A',
  },
});
