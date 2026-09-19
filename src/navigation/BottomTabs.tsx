/**
 * Navegação por abas, implementada com estado local.
 *
 * Deliberadamente simples: com duas telas não vale o peso do react-navigation.
 * Quando entrarem AR, ranking e perfil, vale trocar por @react-navigation/bottom-tabs.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MapScreen } from '../screens/MapScreen';
import { COLORS } from '../constants';

type Aba = 'mapa' | 'sensores';

export function BottomTabs() {
  const [aba, setAba] = useState<Aba>('mapa');

  return (
    <View style={styles.container}>
      {/*
        As duas telas ficam montadas e apenas escondidas, para não perder o
        estado (trajeto no mapa, coleta em andamento) ao alternar de aba.
      */}
      <View style={[styles.tela, aba !== 'mapa' && styles.escondida]} pointerEvents={aba === 'mapa' ? 'auto' : 'none'}>
        <MapScreen />
      </View>
      <View style={[styles.tela, aba !== 'sensores' && styles.escondida]} pointerEvents={aba === 'sensores' ? 'auto' : 'none'}>
        <DashboardScreen />
      </View>

      <View style={styles.barra}>
        <TabBotao label="Mapa" ativo={aba === 'mapa'} onPress={() => setAba('mapa')} />
        <TabBotao label="Sensores" ativo={aba === 'sensores'} onPress={() => setAba('sensores')} />
      </View>
    </View>
  );
}

function TabBotao({
  label,
  ativo,
  onPress,
}: {
  label: string;
  ativo: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.indicador, ativo && styles.indicadorAtivo]} />
      <Text style={[styles.tabTexto, ativo && styles.tabTextoAtivo]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tela: {
    ...StyleSheet.absoluteFillObject,
    bottom: 64, // altura da barra de abas
  },
  escondida: {
    opacity: 0,
  },
  barra: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  indicador: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  indicadorAtivo: {
    backgroundColor: COLORS.primary,
  },
  tabTexto: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextoAtivo: {
    color: COLORS.textPrimary,
  },
});
