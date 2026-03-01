import React, { createContext, useContext, useMemo } from 'react';
import { useAppSelector } from '../redux/hooks';
import { buildTheme, AppTheme } from './index';

const ThemeContext = createContext<AppTheme>(buildTheme('light'));

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const darkMode = useAppSelector((state) => state.preferences.darkMode);
  const theme = useMemo(() => buildTheme(darkMode ? 'dark' : 'light'), [darkMode]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
