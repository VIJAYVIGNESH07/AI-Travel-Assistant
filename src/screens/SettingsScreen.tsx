import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import SettingsRow from '../components/molecules/SettingsRow';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { toggleDarkMode } from '../redux/slices/preferencesSlice';
import { signOut } from '../redux/slices/authSlice';
import type { RootStackParamList } from '../navigation/types';

const SettingsScreen = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((state) => state.preferences);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('auth_token');
          dispatch(signOut());
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        }
      }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your data including posts, stories, and profile. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              dispatch(signOut());
              navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account data.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Settings</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Account</Text>
          <SettingsRow title="Edit Profile" right={<Text style={{ color: theme.colors.primary }}>View</Text>} />
          <SettingsRow title="Privacy and Security" right={<Text style={{ color: theme.colors.primary }}>View</Text>} />
          <SettingsRow title="Notifications" right={<Text style={{ color: theme.colors.primary }}>View</Text>} />
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Preferences</Text>
          <SettingsRow
            title="Dark Mode"
            right={<Switch value={prefs.darkMode} onValueChange={() => { dispatch(toggleDarkMode()); }} />}
          />
          <SettingsRow title="Language" subtitle={prefs.language} right={<Text style={{ color: theme.colors.primary }}>Change</Text>} />
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>About</Text>
          <SettingsRow title="Help and Support" right={<Text style={{ color: theme.colors.primary }}>Open</Text>} />
          <SettingsRow title="Terms of Service" right={<Text style={{ color: theme.colors.primary }}>Open</Text>} />
          <SettingsRow title="Privacy Policy" right={<Text style={{ color: theme.colors.primary }}>Open</Text>} />
          <SettingsRow title="App Version" subtitle="v1.0.0" />
        </View>

        <Pressable
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.logoutText, { color: theme.colors.danger }]}>Log out</Text>
        </Pressable>

        <Pressable
          onPress={handleDeleteAccount}
          style={[styles.deleteAccountButton, { backgroundColor: theme.colors.danger }]}
        >
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  scrollContent: {
    paddingBottom: 24
  },
  header: {
    paddingVertical: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '700'
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700'
  },
  deleteAccountButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20
  },
  deleteAccountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});

export default SettingsScreen;
