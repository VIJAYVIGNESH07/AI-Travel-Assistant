import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

const ChatInput = ({ value, onChangeText, onSend, disabled = false }: Props) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Ask me anything..."
        placeholderTextColor={theme.colors.slate500}
        style={[styles.input, { color: theme.colors.textPrimary }]}
        editable={!disabled}
        returnKeyType="send"
        onSubmitEditing={onSend}
        blurOnSubmit={false}
      />
      <Pressable
        onPress={onSend}
        disabled={disabled || !value.trim()}
        style={[
          styles.iconButton,
          { backgroundColor: disabled || !value.trim() ? theme.colors.slate100 : theme.colors.primary }
        ]}
      >
        <Ionicons name="send" size={16} color={disabled || !value.trim() ? theme.colors.slate500 : '#FFFFFF'} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
    marginRight: 4
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
