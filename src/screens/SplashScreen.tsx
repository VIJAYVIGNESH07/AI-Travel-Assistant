import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import { useAppDispatch } from '../redux/hooks';
import { completeOnboarding } from '../redux/slices/onboardingSlice';
import { signIn } from '../redux/slices/authSlice';
import type { RootStackParamList } from '../navigation/types';
import { getUserByEmail, toUserProfile } from '../utils/userDatabase';

const SplashScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const [nextRoute, setNextRoute] = useState<keyof RootStackParamList>('Onboarding');

  const scale = useSharedValue(0.8);
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });

    const bootstrap = async () => {
      const onboardedFlag = await AsyncStorage.getItem('onboarding_complete');
      const token = await AsyncStorage.getItem('auth_token');
      let hasValidSession = false;

      if (onboardedFlag) {
        dispatch(completeOnboarding());
      }
      if (token) {
        const savedUser = await getUserByEmail(token);
        if (savedUser) {
          dispatch(signIn(toUserProfile(savedUser)));
          hasValidSession = true;
        } else {
          await AsyncStorage.removeItem('auth_token');
        }
      }

      const route = onboardedFlag ? (hasValidSession ? 'MainTabs' : 'Auth') : 'Onboarding';
      setNextRoute(route);
    };

    bootstrap();
  }, [dispatch, scale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(nextRoute);
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigation, nextRoute]);

  return (
    <LinearGradient colors={theme.colors.gradients.ocean} style={styles.container}>
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Image source={require('../../assets/wandermate-logo.png')} style={styles.logoImage} contentFit="contain" />
      </Animated.View>
      <Text style={styles.brand}>WanderMate</Text>
      <Text style={styles.tagline}>Your Journey Begins</Text>
      <ActivityIndicator color="#FFFFFF" style={styles.loader} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoImage: {
    width: '100%',
    height: '100%'
  },
  brand: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700'
  },
  tagline: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 14
  },
  loader: {
    marginTop: 24
  }
});

export default SplashScreen;
