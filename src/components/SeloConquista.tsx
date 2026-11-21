/** Selo circular de uma conquista: colorido com o ícone quando desbloqueada, apagado com cadeado quando não. */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConquistaDoUsuario } from '../types';
import { corDoSelo, iconeDaConquista } from '../utils/conquistas';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';

interface Props {
  conquista: ConquistaDoUsuario;
  /** Posição na lista (da mais fácil à mais difícil): define a cor do selo. */
  posicao: number;
  onPress: () => void;
}

export function SeloConquista({ conquista, posicao, onPress }: Props) {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
  const cor = corDoSelo(posicao);
  const ativo = conquista.desbloqueada;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${conquista.titulo}: ${ativo ? 'desbloqueada' : 'bloqueada'}`}
    >
      <View style={[styles.anel, ativo ? { borderColor: cor, backgroundColor: cor } : styles.anelBloqueado]}>
        <View style={[styles.miolo, !ativo && { backgroundColor: cores.background }]}>
          <Ionicons
            name={ativo ? iconeDaConquista(conquista.titulo) : 'lock-closed'}
            size={ativo ? 28 : 22}
            color={ativo ? cor : cores.textMuted}
          />
        </View>
      </View>
      <Text style={[styles.titulo, !ativo && styles.tituloBloqueado]} numberOfLines={2}>
        {conquista.titulo}
      </Text>
    </TouchableOpacity>
  );
}

const criarEstilos = (cores: Tema) =>
  StyleSheet.create({
    container: {
      width: '33.33%',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 6,
    },
    anel: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    anelBloqueado: {
      borderColor: cores.cardBorder,
      backgroundColor: cores.cardBorder,
    },
    miolo: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: cores.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulo: {
      fontSize: 12,
      fontWeight: '700',
      color: cores.textPrimary,
      textAlign: 'center',
    },
    tituloBloqueado: {
      color: cores.textMuted,
    },
  });
