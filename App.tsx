import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import store from './src/redux/store';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';

const AppShell = () => {
  const theme = useTheme();
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      border: theme.colors.border,
      text: theme.colors.textPrimary,
      primary: theme.colors.primary
    }
  };

  const paperBase = theme.mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const paperTheme = {
    ...paperBase,
    colors: {
      ...paperBase.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      surface: theme.colors.surface,
      onSurface: theme.colors.textPrimary
    }
  };

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </ReduxProvider>
  );
}
