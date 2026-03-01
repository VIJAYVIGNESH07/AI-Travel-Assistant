import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

const SegmentedControl = ({ options, value, onChange }: Props) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.slate100 }]}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.segment,
              { backgroundColor: selected ? theme.colors.surface : 'transparent' }
            ]}
          >
            <Text style={[styles.label, { color: selected ? theme.colors.textPrimary : theme.colors.textSecondary }]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: 13,
    fontWeight: '600'
  }
});

export default SegmentedControl;
