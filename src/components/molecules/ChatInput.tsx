import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
};

const ChatInput = ({ value, onChangeText, onSend }: Props) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Ask me anything"
        placeholderTextColor={theme.colors.slate500}
        style={[styles.input, { color: theme.colors.textPrimary }]}
      />
      <Pressable style={[styles.iconButton, { backgroundColor: theme.colors.slate100 }]}
      >
        <Ionicons name="mic" size={18} color={theme.colors.slate700} />
      </Pressable>
      <Pressable onPress={onSend} style={[styles.iconButton, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="send" size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  input: {
    flex: 1,
    fontSize: 14,
    marginRight: 8
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6
  }
});

export default ChatInput;
