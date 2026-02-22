// ─── Sanatan Seva Platform – Spiritual Theme ─────────────────────────────────
// Inspired by the Ramji Ki Sena website: deep saffron, warm cream, sacred gold

import { ViewStyle } from 'react-native';

export const Colors = {
  // ── Primary Saffron/Red Palette ───────────────────────────────
  saffron: '#E65100',
  saffronLight: '#FF6D00',
  saffronDark: '#BF360C',
  crimson: '#B71C1C',
  crimsonDark: '#7F0000',
  crimsonMid: '#C62828',

  // ── Gold & Amber Accents ─────────────────────────────────────
  gold: '#F9A825',
  goldLight: '#FFD54F',
  goldDark: '#E65100',
  amber: '#FF8F00',
  amberLight: '#FFB300',

  // ── Warm Backgrounds ─────────────────────────────────────────
  cream: '#FFF8F0',
  creamDeep: '#FFF3E0',
  creamDark: '#FFE0B2',
  parchment: '#FFEFD5',
  lotus: '#FCE4EC',

  // ── Neutrals ─────────────────────────────────────────────────
  white: '#FFFFFF',
  darkText: '#3E2723',
  brownMid: '#6D4C41',
  brownLight: '#A1887F',
  divider: '#FFCCBC',
  border: '#FFCCBC',

  // ── Status Colors ─────────────────────────────────────────────
  success: '#2E7D32',
  successLight: '#E8F5E9',
  info: '#0277BD',
  infoLight: '#E1F5FE',
  warning: '#F57F17',

  // ── Gradient Arrays ──────────────────────────────────────────
  gradientSaffron: ['#BF360C', '#E65100', '#FF6D00'] as [string, string, string],
  gradientCrimson: ['#7F0000', '#B71C1C', '#C62828'] as [string, string, string],
  gradientGold: ['#E65100', '#F9A825', '#FFD54F'] as [string, string, string],
  gradientCream: ['#FFF8F0', '#FFF3E0'] as [string, string],
  gradientCard: ['#FFFFFF', '#FFF8F0'] as [string, string],
  gradientHero: ['#7F0000', '#B71C1C', '#E65100'] as [string, string, string],
  gradientSunrise: ['#BF360C', '#E65100', '#F9A825'] as [string, string, string],
} as const;

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,
  hero: 46,

  // Font weights
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export const Shadow: Record<string, ShadowStyle> = {
  card: {
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  gold: {
    shadowColor: '#F9A825',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  crimson: {
    shadowColor: '#B71C1C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  dark: {
    shadowColor: '#3E2723',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
};

// ── Sacred Symbols used as decorative elements ─────────────────
export const SacredSymbols = {
  om: 'ॐ',
  swastik: '卐',
  lotus: '🪷',
  diya: '🪔',
  bell: '🔔',
  trishul: '🔱',
  flower: '🌸',
  pray: '🙏',
  flag: '🚩',
  temple: '🛕',
  star: '✨',
} as const;
