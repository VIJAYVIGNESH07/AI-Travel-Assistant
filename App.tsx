import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import * as ExpoLinking from 'expo-linking';
import store from './src/redux/store';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';
import { applyHiddenSpotVerificationFromLink } from './src/utils/hiddenSpotStorage';

const AppShell = () => {
  const theme = useTheme();
  const linking = {
    prefixes: ['wandermate://'],
    config: {
      screens: {
        AdminHiddenSpotReview: 'admin-hidden-spot-review'
      }
    }
  };

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

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) {
        return;
      }

      const parsed = ExpoLinking.parse(url);
      const submissionId = parsed.queryParams?.submissionId;
      const action = parsed.queryParams?.action;

      if (typeof submissionId !== 'string') {
        return;
      }

      if (action !== 'approved' && action !== 'rejected') {
        return;
      }

      await applyHiddenSpotVerificationFromLink(submissionId, action);
    };

    ExpoLinking.getInitialURL().then((url) => {
      handleUrl(url);
    });

    const sub = ExpoLinking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme} linking={linking}>
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
