import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
};

const OutlineButton = ({ title, onPress, style }: Props) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { borderColor: theme.colors.primary }, pressed && styles.pressed, style]}
    >
      <Text style={[styles.text, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 16,
    fontWeight: '600'
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }]
  }
});

export default OutlineButton;
