/**
 * Paletas dos temas claro e escuro. Todas as telas leem as cores pelo `useTema()`;
 * as chaves são as mesmas de `HOME_COLORS` (o tema claro), mais algumas de superfície.
 */
import { HOME_COLORS } from './index';

type Chaves = keyof typeof HOME_COLORS;

const EXTRAS_CLARO = {
  /** Cartões que flutuam sobre o mapa ou a câmera. */
  superficieTranslucida: 'rgba(255, 255, 255, 0.96)',
  /** Fundo suave de destaque (linha do usuário, ícones). */
  destaqueSuave: '#EEF2FF',
  erroFundo: '#FEF2F2',
  erroBorda: '#FECACA',
  erroTexto: '#B91C1C',
  avisoFundo: '#FEF3C7',
  avisoTexto: '#B45309',
  /** Texto e ícones sobre fundos de cor (botões, cabeçalhos). */
  sobreAcento: '#FFFFFF',
};

export type Tema = { [K in Chaves | keyof typeof EXTRAS_CLARO]: string };

export const TEMA_CLARO: Tema = { ...HOME_COLORS, ...EXTRAS_CLARO };

export const TEMA_ESCURO: Tema = {
  background: '#0E1222',
  card: '#171C30',
  cardBorder: '#262C47',

  accent: '#4C6EF5',
  accentLight: '#6D8AF7',
  accentGradientStart: '#2B3F9E',
  accentGradientEnd: '#3B5BDB',

  textPrimary: '#F1F3F9',
  textSecondary: '#A3AAC2',
  textMuted: '#6F7894',

  xpGold: '#F5A623',
  xpBarBg: 'rgba(255, 255, 255, 0.25)',

  success: '#34D399',
  successBg: '#12332A',
  successText: '#34D399',

  missionIcon: '#8FA6FF',
  missionIconBg: '#232A4A',

  discoverBlue: '#6D8AF7',
  discoverPurple: '#A78BFA',

  tabActive: '#6D8AF7',
  tabInactive: '#6F7894',
  tabBar: '#171C30',
  tabBarBorder: '#262C47',

  superficieTranslucida: 'rgba(23, 28, 48, 0.96)',
  destaqueSuave: '#232A4A',
  erroFundo: '#3A1A1F',
  erroBorda: '#6B2A33',
  erroTexto: '#FCA5A5',
  avisoFundo: '#3A2F12',
  avisoTexto: '#FBBF24',
  sobreAcento: '#FFFFFF',
};

/**
 * Temas comprados na loja (códigos do catálogo da API). Cada um parte do tema claro ou do
 * escuro e troca as cores de fundo e de destaque; as demais (erro, sucesso...) são herdadas.
 */
export const TEMAS_LOJA: Record<string, { cores: Tema; escuro: boolean }> = {
  'tema-oceano': {
    escuro: false,
    cores: {
      ...TEMA_CLARO,
      background: '#ECFEFF',
      cardBorder: '#CFFAFE',
      accent: '#0E7490',
      accentLight: '#0891B2',
      accentGradientStart: '#0E7490',
      accentGradientEnd: '#06B6D4',
      missionIcon: '#0891B2',
      missionIconBg: '#CFFAFE',
      discoverBlue: '#0891B2',
      discoverPurple: '#0EA5E9',
      tabActive: '#0891B2',
      tabBarBorder: '#CFFAFE',
      destaqueSuave: '#CFFAFE',
    },
  },
  'tema-floresta': {
    escuro: false,
    cores: {
      ...TEMA_CLARO,
      background: '#F0FDF4',
      cardBorder: '#DCFCE7',
      accent: '#166534',
      accentLight: '#15803D',
      accentGradientStart: '#14532D',
      accentGradientEnd: '#16A34A',
      missionIcon: '#15803D',
      missionIconBg: '#DCFCE7',
      discoverBlue: '#16A34A',
      discoverPurple: '#65A30D',
      tabActive: '#15803D',
      tabBarBorder: '#DCFCE7',
      destaqueSuave: '#DCFCE7',
    },
  },
  'tema-por-do-sol': {
    escuro: false,
    cores: {
      ...TEMA_CLARO,
      background: '#FFF7ED',
      cardBorder: '#FED7AA',
      accent: '#C2410C',
      accentLight: '#EA580C',
      accentGradientStart: '#C2410C',
      accentGradientEnd: '#DB2777',
      missionIcon: '#EA580C',
      missionIconBg: '#FFEDD5',
      discoverBlue: '#EA580C',
      discoverPurple: '#DB2777',
      tabActive: '#EA580C',
      tabBarBorder: '#FED7AA',
      destaqueSuave: '#FFEDD5',
    },
  },
  'tema-noite-uvv': {
    escuro: true,
    cores: {
      ...TEMA_ESCURO,
      background: '#0B1430',
      card: '#13204A',
      cardBorder: '#1F2F63',
      accent: '#3550C8',
      accentGradientStart: '#1B2B5E',
      accentGradientEnd: '#2A4FA0',
      xpGold: '#FFB300',
      missionIcon: '#FFC94D',
      missionIconBg: '#1F2F63',
      discoverBlue: '#FFC94D',
      tabActive: '#FFB300',
      tabBar: '#13204A',
      tabBarBorder: '#1F2F63',
      superficieTranslucida: 'rgba(19, 32, 74, 0.96)',
      destaqueSuave: '#1F2F63',
    },
  },
};
