import { lightColors, darkColors } from './colors';
import spacing from './spacing';
import typography from './typography';
import shadows from './shadows';

export type ThemeMode = 'light' | 'dark';

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999
};

export const buildTheme = (mode: ThemeMode) => {
  const colors = mode === 'dark' ? darkColors : lightColors;
  return {
    mode,
    colors,
    spacing,
    typography,
    radius,
    shadows
  };
};

export type AppTheme = ReturnType<typeof buildTheme>;
