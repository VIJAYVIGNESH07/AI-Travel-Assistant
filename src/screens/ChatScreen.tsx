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
import { generateBookingLinks, isInternationalTrip } from '../utils/chatApi';
import { addAssistantMessage, addUserMessage, getChatMessages, subscribeToChat } from '../utils/chatStore';
import { ChatMessage, ChatPlanResponse, ChatPlanOption, ChatItineraryDay } from '../utils/chatTypes';

const formatINR = (amount: number) => `\u20b9${amount.toLocaleString('en-IN')}`;

const ChatScreen = () => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(getChatMessages());
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    return subscribeToChat((msgs) => {
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
  }, []);

  const buildHistory = (items: ChatMessage[]) =>
    items.slice(-10).map((item) => ({ role: item.role, content: item.text }));

  const openLink = async (link: string) => {
    try {
      const canOpen = await Linking.canOpenURL(link);
      if (!canOpen) {
        Alert.alert('Unable to open link', 'This link cannot be opened on your device.');
        return;
      }
      await Linking.openURL(link);
    } catch {
      Alert.alert('Link error', 'Could not open this link.');
    }
  };

  /* ── Send any message directly to the LLM ── */
  const handleSend = async (overrideMessage?: string) => {
    const value = (overrideMessage ?? message).trim();
    if (!value || loading) return;

    addUserMessage(value);
    setMessage('');
    setLoading(true);

    try {
      const history = buildHistory(getChatMessages());
      const response = await sendChatMessage({ message: value, history });
      addAssistantMessage(response.reply || 'I am here to help with your travel plans.', response.data);
    } catch {
      addAssistantMessage('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Booking links (shown when AI returns a structured plan) ── */
  const renderBookingLinks = (data: ChatPlanResponse) => {
    const origin = data.origin;
    const destination = data.destination;
    if (!origin || !destination) return null;

    const international = isInternationalTrip(origin, destination);
    const links = generateBookingLinks(origin, destination, international);

    const colors: Record<string, { bg: string; border: string; badge: string }> = {
      'IRCTC': { bg: '#E3F2FD', border: '#90CAF9', badge: '#1565C0' },
      'IndiGo': { bg: '#EDE7F6', border: '#CE93D8', badge: '#6A1B9A' },
      'Skyscanner': { bg: '#E0F7FA', border: '#80DEEA', badge: '#00695C' },
      'Google Flights': { bg: '#FFF9C4', border: '#FFF176', badge: '#F57F17' },
      'Air India': { bg: '#FCE4EC', border: '#F48FB1', badge: '#AD1457' },
      'Redbus': { bg: '#FBE9E7', border: '#FFAB91', badge: '#BF360C' },
    };

    return (
      <View style={styles.bookingSection}>
        <Text style={[styles.bookingTitle, { color: theme.colors.textPrimary }]}>
          Book Your Trip — Live Results
        </Text>
        <Text style={[styles.bookingSubtitle, { color: theme.colors.textSecondary }]}>
          {origin} to {destination} — tap to open live prices
        </Text>
        {links.map((link, i) => {
          const c = colors[link.provider] ?? { bg: '#F5F5F5', border: '#BDBDBD', badge: '#424242' };
          return (
            <Pressable
              key={`book-${i}`}
              onPress={() => openLink(link.url)}
              style={[styles.bookingCard, { backgroundColor: c.bg, borderColor: c.border }]}
            >
              <View style={styles.bookingCardLeft}>
                <View style={[styles.bookingBadge, { backgroundColor: c.badge }]}>
                  <Text style={styles.bookingBadgeText}>{link.type}</Text>
                </View>
                <View style={styles.bookingCardText}>
                  <Text style={[styles.bookingProvider, { color: theme.colors.textPrimary }]}>
                    {link.provider}
                  </Text>
                  <Text style={[styles.bookingNote, { color: theme.colors.textSecondary }]}>
                    {link.note}
                  </Text>
                </View>
              </View>
              <View style={[styles.bookNowBtn, { backgroundColor: c.badge }]}>
                <Text style={styles.bookNowText}>Book Now</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  /* ── Plan card rendering ── */
  const renderItinerary = (itinerary: ChatItineraryDay[]) => (
    <View style={styles.itineraryWrap}>
      {itinerary.map((dayItem) => (
        <View key={`day-${dayItem.day}`} style={styles.dayBlock}>
          <Text style={[styles.dayTitle, { color: theme.colors.primary }]}>Day {dayItem.day}</Text>
          {dayItem.plan.map((activity, ai) => (
            <View key={`act-${dayItem.day}-${ai}`} style={styles.activityRow}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>{'\u2022'}</Text>
              <Text style={[styles.activityText, { color: theme.colors.textPrimary }]}>{activity}</Text>
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
      <Text style={[styles.planTitle, { color: theme.colors.primary }]}>{plan.label}</Text>

      {plan.itinerary?.length ? renderItinerary(plan.itinerary) : null}

      {plan.attractions?.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>Attractions</Text>
          {plan.attractions.map((a, i) => (
            <Text key={`attr-${i}`} style={[styles.planText, { color: theme.colors.textSecondary }]}>
              {'\u2022'} {a}
            </Text>
          ))}
        </View>
      ) : null}

      {plan.transport?.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>Transport</Text>
          {plan.transport.map((option, ti) => (
            <Pressable key={`tr-${ti}`} onPress={() => openLink(option.link)} style={styles.transportLink}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                {option.type} via {option.provider}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {plan.hotels?.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>Hotels</Text>
          {plan.hotels.map((hotel, hi) => (
            <Text key={`hotel-${hi}`} style={[styles.planText, { color: theme.colors.textSecondary }]}>
              {'\u2022'} {hotel.name}{hotel.area ? ` (${hotel.area})` : ''}{hotel.approx_price ? ` - ${hotel.approx_price}` : ''}
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
        {data.budget?.total_estimate ? (
          <View style={[styles.budgetCard, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}>
            <Text style={[styles.budgetTitle, { color: '#2E7D32' }]}>Budget Estimate</Text>
            <Text style={[styles.budgetTotal, { color: '#1B5E20' }]}>
              {formatINR(data.budget.total_estimate)}
            </Text>
            {data.budget.breakdown ? (
              <View style={styles.breakdownRow}>
                {data.budget.breakdown.transport ? (
                  <Text style={styles.breakdownItem}>Transport: {formatINR(data.budget.breakdown.transport)}</Text>
                ) : null}
                {data.budget.breakdown.lodging ? (
                  <Text style={styles.breakdownItem}>Hotel: {formatINR(data.budget.breakdown.lodging)}</Text>
                ) : null}
                {data.budget.breakdown.food ? (
                  <Text style={styles.breakdownItem}>Food: {formatINR(data.budget.breakdown.food)}</Text>
                ) : null}
                {data.budget.breakdown.local_transport ? (
                  <Text style={styles.breakdownItem}>Local: {formatINR(data.budget.breakdown.local_transport)}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {data.plans?.map(renderPlanOption)}

        {data.feasible === false && data.alternatives?.length ? (
          <View style={[styles.altCard, { backgroundColor: '#FFF3E0', borderColor: '#FFCC80' }]}>
            <Text style={[styles.sectionHeading, { color: '#E65100' }]}>Alternatives</Text>
            {data.alternatives.map((alt, ai) => (
              <Text key={`alt-${ai}`} style={[styles.planText, { color: '#BF360C' }]}>
                {'\u2022'} {alt}
              </Text>
            ))}
          </View>
        ) : null}

        {data.notes?.length ? (
          <View>
            {data.notes.map((note, ni) => (
              <Text key={`note-${ni}`} style={[styles.noteText, { color: theme.colors.textSecondary }]}>
                Note: {note}
              </Text>
            ))}
          </View>
        ) : null}

        {renderBookingLinks(data)}
      </View>
    );
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
            <View style={styles.messageRow}>
              <View
                style={[
                  styles.bubble,
                  item.role === 'user'
                    ? { alignSelf: 'flex-end', backgroundColor: '#22C55E' }
                    : { alignSelf: 'flex-start', backgroundColor: '#0EA5E9' }
                ]}
              >
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>
              {item.role === 'assistant' && item.data ? renderPlanData(item.data) : null}
            </View>
          )}
        />

        {/* Suggestion chips */}
        <View style={styles.chipsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {chatSuggestions.map((item) => (
              <Chip key={item} label={item} onPress={() => handleSend(item)} />
            ))}
          </ScrollView>
        </View>

        {/* Input */}
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
  flex: { flex: 1 },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { marginTop: 4, fontSize: 12 },
  messages: { paddingHorizontal: 16, paddingBottom: 8, flexGrow: 1 },
  messageRow: { width: '100%', marginBottom: 6 },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 2
  },
  bubbleText: { fontSize: 14, lineHeight: 21, color: '#FFFFFF' },
  chipsRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8
  },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  inputWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  loader: { marginTop: 6 },
  planWrap: { paddingHorizontal: 4, paddingBottom: 10 },
  budgetCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  budgetTitle: { fontSize: 12, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  budgetTotal: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  breakdownRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  breakdownItem: {
    fontSize: 11, color: '#388E3C', backgroundColor: '#C8E6C9',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8
  },
  planCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  planTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  itineraryWrap: { marginBottom: 8 },
  dayBlock: { marginBottom: 10 },
  dayTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 },
  bullet: { fontSize: 14, marginRight: 6, lineHeight: 20 },
  activityText: { flex: 1, fontSize: 13, lineHeight: 19 },
  section: { marginTop: 8 },
  sectionHeading: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  planText: { fontSize: 13, marginBottom: 4, lineHeight: 18 },
  transportLink: { marginBottom: 5 },
  linkText: { fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  altCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  noteText: { fontSize: 12, marginTop: 4, lineHeight: 17, fontStyle: 'italic' },
  bookingSection: { marginTop: 8, marginBottom: 12, paddingHorizontal: 4 },
  bookingTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  bookingSubtitle: { fontSize: 12, marginBottom: 10 },
  bookingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8
  },
  bookingCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bookingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  bookingBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  bookingCardText: { flex: 1 },
  bookingProvider: { fontSize: 14, fontWeight: '600' },
  bookingNote: { fontSize: 12, marginTop: 1 },
  bookNowBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, marginLeft: 8 },
  bookNowText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }
});

export default ChatScreen;
