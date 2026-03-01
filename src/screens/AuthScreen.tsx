import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import SegmentedControl from '../components/molecules/SegmentedControl';
import GradientButton from '../components/atoms/GradientButton';
import { useAppDispatch } from '../redux/hooks';
import { signIn } from '../redux/slices/authSlice';
import type { RootStackParamList } from '../navigation/types';
import { getUserByEmail, saveUser, toUserProfile } from '../utils/userDatabase';

const defaultAvatar =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80';

const AuthScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [remember, setRemember] = useState(true);

  const isLogin = mode === 'Login';

  const handleContinue = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!normalizedEmail || !password) {
      Alert.alert('Missing details', 'Enter email and password.');
      return;
    }

    if (isLogin) {
      const existingUser = await getUserByEmail(normalizedEmail);
      if (!existingUser || existingUser.password !== password) {
        Alert.alert('Login failed', 'Invalid email or password.');
        return;
      }

      dispatch(signIn(toUserProfile(existingUser)));
      await AsyncStorage.setItem('auth_token', normalizedEmail);
      navigation.replace('MainTabs');
      return;
    }

    if (!trimmedName || !confirm) {
      Alert.alert('Missing details', 'Enter user name, email, password and confirm password.');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Password and confirm password must match.');
      return;
    }

    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      Alert.alert('Account exists', 'This email is already registered. Please log in.');
      return;
    }

    await saveUser({
      name: trimmedName,
      email: normalizedEmail,
      password,
      location: 'New York, USA',
      avatar: defaultAvatar
    });

    Alert.alert('Sign up successful', 'Account created. Please log in with your email and password.');
    setMode('Login');
    setPassword('');
    setConfirm('');
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <LinearGradient colors={theme.colors.gradients.twilight} style={styles.header}
      >
        <Text style={styles.brand}>WanderMate</Text>
        <Text style={styles.tagline}>Adventure Awaits</Text>
      </LinearGradient>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}
      >
        <SegmentedControl options={['Login', 'Sign Up']} value={mode} onChange={setMode} />

        {!isLogin && (
          <TextInput
            mode="outlined"
            label="User Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        )}

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {!isLogin && (
          <TextInput
            mode="outlined"
            label="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            style={styles.input}
          />
        )}

        {!isLogin && (
          <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>
            Password strength: Medium
          </Text>
        )}

        <View style={styles.row}>
          <View style={styles.row}>
            <Switch value={remember} onValueChange={setRemember} />
            <Text style={[styles.helper, { color: theme.colors.textSecondary, marginLeft: 8 }]}>Remember me</Text>
          </View>
          <Text style={[styles.helper, { color: theme.colors.primary }]}>Forgot password</Text>
        </View>

        <GradientButton title="Continue" onPress={handleContinue} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700'
  },
  tagline: {
    marginTop: 6,
    color: '#FFFFFF'
  },
  card: {
    marginTop: -24,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16
  },
  input: {
    marginTop: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12
  },
  helper: {
    fontSize: 12
  }
});

export default AuthScreen;
