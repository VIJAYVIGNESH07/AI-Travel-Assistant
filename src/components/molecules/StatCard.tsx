import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  value: string;
  label: string;
};

const StatCard = ({ value, label }: Props) => {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  value: {
    fontSize: 16,
    fontWeight: '700'
  },
  label: {
    fontSize: 11,
    marginTop: 4
  }
});

export default StatCard;
