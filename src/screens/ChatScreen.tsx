import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { chatMessages, chatSuggestions } from '../data/mock';
import Chip from '../components/atoms/Chip';
import ChatInput from '../components/molecules/ChatInput';

const ChatScreen = () => {
  const theme = useTheme();
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>WanderMate AI</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Your travel co-pilot</Text>
      </View>

      <FlatList
        data={chatMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user'
                ? { alignSelf: 'flex-end', backgroundColor: theme.colors.primary }
                : { alignSelf: 'flex-start', backgroundColor: theme.colors.slate100 }
            ]}
          >
            <Text style={[styles.bubbleText, { color: item.role === 'user' ? '#FFFFFF' : theme.colors.textPrimary }]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      <View style={styles.suggestions}>
        {chatSuggestions.map((item) => (
          <Chip key={item} label={item} />
        ))}
      </View>

      <View style={styles.inputWrap}>
        <ChatInput value={message} onChangeText={setMessage} onSend={() => setMessage('')} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12
  },
  messages: {
    paddingHorizontal: 20,
    paddingBottom: 12
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10
  },
  bubbleText: {
    fontSize: 14
  },
  suggestions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12
  },
  inputWrap: {
    paddingHorizontal: 20,
    paddingBottom: 20
  }
});

export default ChatScreen;
