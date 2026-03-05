import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { chatSuggestions } from '../data/mock';
import Chip from '../components/atoms/Chip';
import ChatInput from '../components/molecules/ChatInput';
import { sendChatMessage } from '../utils/chatApi';
import { addAssistantMessage, addUserMessage, getChatMessages, subscribeToChat } from '../utils/chatStore';
import { ChatMessage, ChatPlanResponse, ChatPlanOption, ChatItineraryDay } from '../utils/chatTypes';

/** Format a number as ₹ with commas, e.g. 15000 → ₹15,000 */
const formatINR = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

const ChatScreen = () => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(getChatMessages());
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    return subscribeToChat((msgs) => {
      setMessages(msgs);
      // Auto-scroll to bottom on new message
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
  }, []);

  const buildHistory = (items: ChatMessage[]) =>
    items.slice(-6).map((item) => ({ role: item.role, content: item.text }));

  const openLink = async (link: string) => {
    try {
      const canOpen = await Linking.canOpenURL(link);
      if (!canOpen) {
        Alert.alert('Unable to open link', 'This link cannot be opened on your device.');
        return;
      }
      await Linking.openURL(link);
    } catch {
      Alert.alert('Link error', 'Could not open the transport link.');
    }
  };

  /* ── Plan rendering helpers ── */

  const renderItinerary = (itinerary: ChatItineraryDay[]) => (
    <View style={styles.itineraryWrap}>
      {itinerary.map((dayItem) => (
        <View key={`day-${dayItem.day}`} style={styles.dayBlock}>
          <Text style={[styles.dayTitle, { color: theme.colors.primary }]}>
            Day {dayItem.day}
          </Text>
          {dayItem.plan.map((activity, ai) => (
            <View key={`act-${dayItem.day}-${ai}`} style={styles.activityRow}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.activityText, { color: theme.colors.textPrimary }]}>
                {activity}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderPlanOption = (plan: ChatPlanOption, index: number) => (
    <View
      key={`${plan.label}-${index}`}
      style={[styles.planCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <Text style={[styles.planTitle, { color: theme.colors.primary }]}>
        📋 {plan.label}
      </Text>

      {/* Day-wise itinerary */}
      {plan.itinerary?.length ? renderItinerary(plan.itinerary) : null}

      {/* Attractions */}
      {plan.attractions?.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>🏛 Attractions</Text>
          {plan.attractions.map((a, i) => (
            <Text key={`attr-${i}`} style={[styles.planText, { color: theme.colors.textSecondary }]}>
              • {a}
            </Text>
          ))}
        </View>
      ) : null}

      {/* Transport */}
      {plan.transport?.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>🚂 Transport</Text>
          {plan.transport.map((option, ti) => (
            <Pressable
              key={`tr-${ti}`}
              onPress={() => openLink(option.link)}
              style={styles.transportLink}
            >
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                {option.type} via {option.provider} →
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Hotels */}
      {plan.hotels?.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>🏨 Hotels</Text>
          {plan.hotels.map((hotel, hi) => (
            <Text key={`hotel-${hi}`} style={[styles.planText, { color: theme.colors.textSecondary }]}>
              • {hotel.name}{hotel.area ? ` (${hotel.area})` : ''}{hotel.approx_price ? ` — ${hotel.approx_price}` : ''}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );

  const renderPlanData = (data: ChatPlanResponse) => {
    if (!data) return null;

    return (
      <View style={styles.planWrap}>

        {/* Budget summary */}
        {data.budget?.total_estimate ? (
          <View style={[styles.budgetCard, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}>
            <Text style={[styles.budgetTitle, { color: '#2E7D32' }]}>💰 Budget Estimate</Text>
            <Text style={[styles.budgetTotal, { color: '#1B5E20' }]}>
              {formatINR(data.budget.total_estimate)}
            </Text>
            {data.budget.breakdown ? (
              <View style={styles.breakdownRow}>
                {data.budget.breakdown.transport ? (
                  <Text style={styles.breakdownItem}>🚂 {formatINR(data.budget.breakdown.transport)}</Text>
                ) : null}
                {data.budget.breakdown.lodging ? (
                  <Text style={styles.breakdownItem}>🏨 {formatINR(data.budget.breakdown.lodging)}</Text>
                ) : null}
                {data.budget.breakdown.food ? (
                  <Text style={styles.breakdownItem}>🍛 {formatINR(data.budget.breakdown.food)}</Text>
                ) : null}
                {data.budget.breakdown.local_transport ? (
                  <Text style={styles.breakdownItem}>🛺 {formatINR(data.budget.breakdown.local_transport)}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Plan options */}
        {data.plans?.map(renderPlanOption)}

        {/* Infeasible alternatives */}
        {data.feasible === false && data.alternatives?.length ? (
          <View style={[styles.altCard, { backgroundColor: '#FFF3E0', borderColor: '#FFCC80' }]}>
            <Text style={[styles.sectionHeading, { color: '#E65100' }]}>⚠️ Alternatives</Text>
            {data.alternatives.map((alt, ai) => (
              <Text key={`alt-${ai}`} style={[styles.planText, { color: '#BF360C' }]}>
                • {alt}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Notes */}
        {data.notes?.length ? (
          <View>
            {data.notes.map((note, ni) => (
              <Text key={`note-${ni}`} style={[styles.noteText, { color: theme.colors.textSecondary }]}>
                ℹ️ {note}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  const handleSend = async (overrideMessage?: string) => {
    const value = (overrideMessage ?? message).trim();
    if (!value || loading) return;

    addUserMessage(value);
    setMessage('');
    setLoading(true);

    try {
      const history = buildHistory(getChatMessages());
      const response = await sendChatMessage({ message: value, history });
      addAssistantMessage(response.reply || 'Here are your travel options.', response.data);
    } catch {
      addAssistantMessage('Sorry, I could not generate a plan right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>WanderMate AI</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Your travel co-pilot</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View>
              <View
                style={[
                  styles.bubble,
                  item.role === 'user'
                    ? { alignSelf: 'flex-end', backgroundColor: '#22C55E' }
                    : { alignSelf: 'flex-start', backgroundColor: '#0EA5E9' }
                ]}
              >
                <Text style={[styles.bubbleText, { color: '#FFFFFF' }]}>
                  {item.text}
                </Text>
              </View>
              {item.role === 'assistant' && item.data ? renderPlanData(item.data) : null}
            </View>
          )}
        />

        {/* Suggestion chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestions}
        >
          {chatSuggestions.map((item) => (
            <Chip key={item} label={item} onPress={() => handleSend(item)} />
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputWrap}>
          <ChatInput
            value={message}
            onChangeText={setMessage}
            onSend={() => handleSend()}
            disabled={loading}
          />
          {loading ? <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} /> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
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
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20
  },
  suggestions: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8
  },
  inputWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  loader: {
    marginTop: 8
  },
  /* Plan area */
  planWrap: {
    paddingHorizontal: 4,
    paddingBottom: 12
  },
  budgetCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12
  },
  budgetTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2
  },
  budgetTotal: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6
  },
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  breakdownItem: {
    fontSize: 12,
    color: '#388E3C',
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  planCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10
  },
  itineraryWrap: {
    marginBottom: 8
  },
  dayBlock: {
    marginBottom: 10
  },
  dayTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3
  },
  bullet: {
    fontSize: 14,
    marginRight: 6,
    lineHeight: 20
  },
  activityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19
  },
  section: {
    marginTop: 8
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4
  },
  planText: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18
  },
  transportLink: {
    marginBottom: 6
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600'
  },
  altCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },
  noteText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17
  }
});

export default ChatScreen;
