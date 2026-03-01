import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
};

const IconCircle = ({ name, onPress, size = 20, color, style }: Props) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: theme.colors.surface }, pressed && styles.pressed, style]}
    >
      <Ionicons name={name} size={size} color={color || theme.colors.slate700} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pressed: {
    transform: [{ scale: 0.96 }]
  }
});

export default IconCircle;
