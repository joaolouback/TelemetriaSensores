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
