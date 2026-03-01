import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import type { RootStackParamList } from '../navigation/types';

const actions = [
  { label: 'Create Post', route: 'CreatePost', icon: 'image-outline' },
  { label: 'Add Hidden Spot', route: 'HiddenSpot', icon: 'diamond-outline' },
  { label: 'Upload Story', route: 'UploadStory', icon: 'images-outline' }
];

const AddModal = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable style={styles.overlay} onPress={() => navigation.goBack()}>
      <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      <Pressable style={[styles.sheet, { backgroundColor: theme.colors.surface }]} onPress={() => null}
      >
        {actions.map((action) => (
          <Pressable
            key={action.label}
            style={[styles.actionRow, { borderBottomColor: theme.colors.border }]}
            onPress={() => navigation.navigate(action.route as keyof RootStackParamList)}
          >
            <Ionicons name={action.icon as any} size={20} color={theme.colors.textPrimary} />
            <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>{action.label}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.cancel} onPress={() => navigation.goBack()}>
          <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  sheet: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  actionText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600'
  },
  cancel: {
    paddingVertical: 14,
    alignItems: 'center'
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600'
  }
});

export default AddModal;
