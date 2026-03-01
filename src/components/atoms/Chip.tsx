import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

const Chip = ({ label, selected = false, onPress }: Props) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? theme.colors.primary : theme.colors.slate100 }
      ]}
    >
      <Text style={[styles.text, { color: selected ? theme.colors.white : theme.colors.slate700 }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8
  },
  text: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export default Chip;
