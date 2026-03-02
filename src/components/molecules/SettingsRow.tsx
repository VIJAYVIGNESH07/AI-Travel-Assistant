import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
};

const SettingsRow = ({ title, subtitle, right, onPress }: Props) => {
  const theme = useTheme();

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
        {right}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}
    >
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  textBlock: {
    flex: 1
  },
  title: {
    fontSize: 14,
    fontWeight: '600'
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4
  }
});

export default SettingsRow;
