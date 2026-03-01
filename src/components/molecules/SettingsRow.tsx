import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

const SettingsRow = ({ title, subtitle, right }: Props) => {
  const theme = useTheme();
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
