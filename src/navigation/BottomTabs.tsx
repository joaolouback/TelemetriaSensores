/**
 * Navegação por abas com ícones vetoriais elegantes (@expo/vector-icons / Ionicons).
 *
 * Abas:
 * - Início (HomeScreen gamificada)
 * - Mapa (MapScreen em tema claro)
 * - Ranking (RankingScreen)
 * - Loja (LojaScreen)
 * - Perfil (ProfileScreen)
 */
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { RankingScreen } from '../screens/RankingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LojaScreen } from '../screens/LojaScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vibrarSelecao } from '../utils/vibracao';
import { NavegacaoContext, PontoEmFoco } from '../contexts/NavegacaoContext';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';

/** Altura da barra de abas, sem contar a área da navegação do sistema. */
const ALTURA_BARRA = 64;

type Aba = 'inicio' | 'mapa' | 'ranking' | 'loja' | 'perfil';

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
    id: 'loja',
    label: 'Loja',
    iconActive: 'storefront',
    iconInactive: 'storefront-outline',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    iconActive: 'person',
    iconInactive: 'person-outline',
  },
];

export function BottomTabs() {
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
  const [aba, setAba] = useState<Aba>('inicio');
  const [pontoEmFoco, setPontoEmFoco] = useState<PontoEmFoco | null>(null);
  const irParaPonto = useCallback((id: number) => {
    setPontoEmFoco((atual) => ({ id, pedido: (atual?.pedido ?? 0) + 1 }));
    setAba('mapa');
  }, []);
  const navegacao = useMemo(() => ({ irParaPonto, pontoEmFoco }), [irParaPonto, pontoEmFoco]);
  // No Android edge-to-edge o app desenha sob a barra de navegação do sistema:
  // a barra de abas cresce para não ficar embaixo dos botões/gestos.
  const { bottom } = useSafeAreaInsets();
  const alturaBarra = ALTURA_BARRA + bottom;

  return (
    <NavegacaoContext.Provider value={navegacao}>
    <View style={styles.container}>
      <View style={[styles.tela, { bottom: alturaBarra }, aba !== 'inicio' && styles.escondida]} pointerEvents={aba === 'inicio' ? 'auto' : 'none'}>
        <HomeScreen />
      </View>
      <View style={[styles.tela, { bottom: alturaBarra }, aba !== 'mapa' && styles.escondida]} pointerEvents={aba === 'mapa' ? 'auto' : 'none'}>
        {/* As abas ficam montadas (trocar é instantâneo), mas o GPS do mapa só roda com ele visível. */}
        <MapScreen visivel={aba === 'mapa'} />
      </View>
      <View style={[styles.tela, { bottom: alturaBarra }, aba !== 'ranking' && styles.escondida]} pointerEvents={aba === 'ranking' ? 'auto' : 'none'}>
        <RankingScreen />
      </View>
      <View style={[styles.tela, { bottom: alturaBarra }, aba !== 'loja' && styles.escondida]} pointerEvents={aba === 'loja' ? 'auto' : 'none'}>
        <LojaScreen />
      </View>
      <View style={[styles.tela, { bottom: alturaBarra }, aba !== 'perfil' && styles.escondida]} pointerEvents={aba === 'perfil' ? 'auto' : 'none'}>
        <ProfileScreen />
      </View>

      {/* Barra de Navegação Inferior com Ícones Vetoriais */}
      <View accessibilityRole="tablist" style={[styles.barra, { height: alturaBarra, paddingBottom: 8 + bottom }]}>
        {TABS.map((tab) => {
          const ativo = aba === tab.id;
          const iconName = ativo ? tab.iconActive : tab.iconInactive;
          const color = ativo ? cores.accent : cores.textMuted;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => {
                if (!ativo) vibrarSelecao();
                setAba(tab.id);
              }}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={tab.label}
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
    </NavegacaoContext.Provider>
  );
}

const criarEstilos = (cores: Tema) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  tela: {
    ...StyleSheet.absoluteFillObject,
  },
  escondida: {
    opacity: 0,
  },
  barra: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: cores.card,
    borderTopWidth: 1,
    borderTopColor: cores.cardBorder,
    paddingTop: 6,
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
    color: cores.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  tabTextoAtivo: {
    color: cores.accent,
    fontWeight: '800',
  },
});
