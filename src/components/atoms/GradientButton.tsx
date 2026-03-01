import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
};

const GradientButton = ({ title, onPress, style }: Props) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed, style]}
    >
      <LinearGradient
        colors={theme.colors.gradients.ocean}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, { fontFamily: theme.typography.fontFamily }]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  }
});

export default GradientButton;
