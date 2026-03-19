import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert, Pressable } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
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

const AuthScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [backgroundUri, setBackgroundUri] = useState('');
  const [backgroundBase64, setBackgroundBase64] = useState('');
  const [remember, setRemember] = useState(true);

  const isLogin = mode === 'Login';
  const actionButtonTitle = isLogin ? 'Continue' : 'Upload Profile & Continue';

  const pickProfileImage = async (type: 'avatar' | 'background') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to choose images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.75,
      base64: true
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Upload failed', 'Unable to read image data. Try another image.');
      return;
    }

    if (type === 'avatar') {
      setAvatarUri(asset.uri);
      setAvatarBase64(asset.base64);
      return;
    }

    setBackgroundUri(asset.uri);
    setBackgroundBase64(asset.base64);
  };

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

    if (!trimmedName || !confirm || !location.trim() || !bio.trim()) {
      Alert.alert('Missing details', 'Enter name, location, bio, email, password and confirm password.');
      return;
    }

    if (!avatarBase64 || !backgroundBase64) {
      Alert.alert('Missing images', 'Please choose a profile photo and a background image.');
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
      location: location.trim(),
      avatar: `data:image/jpeg;base64,${avatarBase64}`,
      bio: bio.trim(),
      backgroundImage: `data:image/jpeg;base64,${backgroundBase64}`
    });

    Alert.alert('Sign up successful', 'Account created. Please log in with your email and password.');
    setMode('Login');
    setPassword('');
    setConfirm('');
    setLocation('');
    setBio('');
    setAvatarUri('');
    setAvatarBase64('');
    setBackgroundUri('');
    setBackgroundBase64('');
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

        {!isLogin && (
          <View style={styles.mediaInputsWrap}>
            <Text style={[styles.mediaTitle, { color: theme.colors.textPrimary }]}>Profile Photo</Text>
            <Pressable
              style={[styles.mediaPicker, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={() => pickProfileImage('avatar')}
            >
              <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.mediaPickerText, { color: theme.colors.primary }]}>
                {avatarUri ? 'Change Profile Photo' : 'Add Profile Photo'}
              </Text>
            </Pressable>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarPreview} contentFit="cover" /> : null}

            <Text style={[styles.mediaTitle, { color: theme.colors.textPrimary }]}>Background Image</Text>
            <Pressable
              style={[styles.mediaPicker, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={() => pickProfileImage('background')}
            >
              <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.mediaPickerText, { color: theme.colors.primary }]}>
                {backgroundUri ? 'Change Background Image' : 'Add Background Image'}
              </Text>
            </Pressable>
            {backgroundUri ? (
              <Image source={{ uri: backgroundUri }} style={styles.backgroundPreview} contentFit="cover" />
            ) : null}
          </View>
        )}

        {!isLogin && (
          <TextInput
            mode="outlined"
            label="Location"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
        )}

        {!isLogin && (
          <TextInput
            mode="outlined"
            label="Bio"
            value={bio}
            onChangeText={setBio}
            style={styles.input}
            multiline
            numberOfLines={3}
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

        <GradientButton title={actionButtonTitle} onPress={handleContinue} />
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
  mediaInputsWrap: {
    marginTop: 12,
    gap: 8
  },
  mediaTitle: {
    fontSize: 13,
    fontWeight: '600'
  },
  mediaPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  mediaPickerText: {
    fontSize: 13,
    fontWeight: '700'
  },
  avatarPreview: {
    width: 72,
    height: 72,
    borderRadius: 36
  },
  backgroundPreview: {
    width: '100%',
    height: 120,
    borderRadius: 12
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
