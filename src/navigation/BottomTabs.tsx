/**
 * Navegação por abas com ícones vetoriais elegantes (@expo/vector-icons / Ionicons).
 *
 * Abas:
 * - Início (HomeScreen gamificada)
 * - Mapa (MapScreen em tema claro)
 * - Ranking (RankingScreen)
 * - Perfil (ProfileScreen)
 * - Sensores (DashboardScreen para conferência)
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { RankingScreen } from '../screens/RankingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HOME_COLORS } from '../constants';

type Aba = 'inicio' | 'mapa' | 'ranking' | 'perfil' | 'sensores';

interface TabItem {
  id: Aba;
  label: string;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  {
    id: 'inicio',
    label: 'Início',
    iconActive: 'home',
    iconInactive: 'home-outline',
  },
  {
    id: 'mapa',
    label: 'Mapa',
    iconActive: 'map',
    iconInactive: 'map-outline',
  },
  {
    id: 'ranking',
    label: 'Ranking',
    iconActive: 'trophy',
    iconInactive: 'trophy-outline',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    iconActive: 'person',
    iconInactive: 'person-outline',
  },
  {
    id: 'sensores',
    label: 'Sensores',
    iconActive: 'stats-chart',
    iconInactive: 'stats-chart-outline',
  },
];

export function BottomTabs() {
  const [aba, setAba] = useState<Aba>('inicio');

  return (
    <View style={styles.container}>
      <View style={[styles.tela, aba !== 'inicio' && styles.escondida]} pointerEvents={aba === 'inicio' ? 'auto' : 'none'}>
        <HomeScreen />
      </View>
      <View style={[styles.tela, aba !== 'mapa' && styles.escondida]} pointerEvents={aba === 'mapa' ? 'auto' : 'none'}>
        <MapScreen />
      </View>
      <View style={[styles.tela, aba !== 'ranking' && styles.escondida]} pointerEvents={aba === 'ranking' ? 'auto' : 'none'}>
        <RankingScreen />
      </View>
      <View style={[styles.tela, aba !== 'perfil' && styles.escondida]} pointerEvents={aba === 'perfil' ? 'auto' : 'none'}>
        <ProfileScreen />
      </View>
      <View style={[styles.tela, aba !== 'sensores' && styles.escondida]} pointerEvents={aba === 'sensores' ? 'auto' : 'none'}>
        <DashboardScreen />
      </View>

      {/* Barra de Navegação Inferior com Ícones Vetoriais */}
      <View style={styles.barra}>
        {TABS.map((tab) => {
          const ativo = aba === tab.id;
          const iconName = ativo ? tab.iconActive : tab.iconInactive;
          const color = ativo ? HOME_COLORS.accent : HOME_COLORS.textMuted;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => setAba(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons name={iconName} size={24} color={color} />
              <Text style={[styles.tabTexto, ativo && styles.tabTextoAtivo]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },
  tela: {
    ...StyleSheet.absoluteFillObject,
    bottom: 64, // Altura da barra de abas
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
    backgroundColor: HOME_COLORS.card,
    borderTopWidth: 1,
    borderTopColor: HOME_COLORS.cardBorder,
    paddingTop: 6,
    paddingBottom: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTexto: {
    color: HOME_COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  tabTextoAtivo: {
    color: HOME_COLORS.accent,
    fontWeight: '800',
  },
});
