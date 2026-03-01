import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

const SearchBar = ({ value, onChangeText, placeholder }: Props) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <Ionicons name="search" size={18} color={theme.colors.slate500} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search'}
        placeholderTextColor={theme.colors.slate500}
        style={[styles.input, { color: theme.colors.textPrimary }]}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={theme.colors.slate400} />
        </Pressable>
      ) : (
        <View style={styles.clearPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14
  },
  clearPlaceholder: {
    width: 18,
    height: 18
  }
});

export default SearchBar;
