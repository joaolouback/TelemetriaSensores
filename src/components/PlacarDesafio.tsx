/**
 * Placar compacto do desafio em andamento, exibido sobre o mapa:
 * "⚔️ Você 1/3 × 2/3 Bruno · 42:10".
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  return (
    <View style={styles.placar}>
      <Text style={styles.texto} numberOfLines={1}>
        ⚔️ Você {desafio.eu.coletados.length}/{total} × {desafio.oponente?.coletados.length ?? 0}/{total}{' '}
        {nomeOponente}
      </Text>
      <Text style={[styles.tempo, restanteMs < 5 * 60 * 1000 && styles.tempoAcabando]}>⏱ {texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginRight: 8,
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
