import { Dimensions } from 'react-native';

// Zebra MC220: 480x800px, 240dpi, 320x533dp (area util ~320x485dp)
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH <= 320,
} as const;

// Identidade visual Estoque Brasil
export const colors = {
  // Brand
  primary: '#f84704',
  primaryDark: '#d63d03',
  primaryLight: '#ff6b2e',

  // Backgrounds (dark theme para uso em galpao)
  background: '#1a1a1a',
  surface: '#242424',
  surfaceLight: '#2e2e2e',

  // Status
  accent: '#FF9800',
  error: '#F44336',
  warning: '#FFC107',
  success: '#4CAF50',
  info: '#2196F3',

  // Text
  text: '#FFFFFF',
  textSecondary: '#999999',
  textDisabled: '#666666',
  textDark: '#343434',

  // UI
  border: '#383838',
  divider: '#2e2e2e',
  inputBackground: '#2e2e2e',
  overlay: 'rgba(0,0,0,0.7)',

  // WhatsApp green (secondary CTA da marca)
  whatsapp: '#25D366',
} as const;

// Spacing reduzido para tela 320dp
export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
} as const;

// Fontes otimizadas para 4"
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
} as const;
