import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { useTheme } from '../theme/ThemeProvider';
import GradientButton from '../components/atoms/GradientButton';
import { sendChatMessage } from '../utils/chatApi';
import { addAssistantMessage, addUserMessage, getChatMessages } from '../utils/chatStore';
import { ChatMessage, TripRequest } from '../utils/chatTypes';

const TripPlannerScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [dates, setDates] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [travelers, setTravelers] = useState('1');
  const [style, setStyle] = useState('');
  const [preferences, setPreferences] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const buildHistory = (items: ChatMessage[]) =>
    items.slice(-6).map((item) => ({ role: item.role, content: item.text }));

  const handleGenerate = async () => {
    if (loading) return;

    const parsedBudget = Number(budget.replace(/[^0-9.]/g, ''));
    const parsedTravelers = Number(travelers.replace(/[^0-9]/g, ''));
    const tripRequest: TripRequest = {
      origin: origin.trim() || undefined,
      destination: destination.trim() || undefined,
      dates: dates.trim() || undefined,
      budget: {
        amount: Number.isFinite(parsedBudget) ? parsedBudget : undefined,
        currency: currency.trim() || undefined
      },
      travelers: Number.isFinite(parsedTravelers) ? parsedTravelers : undefined,
      style: style.trim() || undefined,
      preferences: preferences.trim() || undefined
    };

    const prompt = `Plan a trip${destination ? ` to ${destination}` : ''}${origin ? ` from ${origin}` : ''}.`;

    addUserMessage(prompt);
    setLoading(true);
    setReady(false);

    try {
      const history = buildHistory(getChatMessages());
      const response = await sendChatMessage({ message: prompt, history, tripRequest });
      addAssistantMessage(response.reply || 'Here are your travel options.', response.data);
      setReady(true);
      navigation.navigate('ChatTab' as never);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unable to generate itinerary.';
      Alert.alert('Trip planner error', messageText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Plan New Trip</Text>
        <TextInput
          mode="outlined"
          label="Origin"
          value={origin}
          onChangeText={setOrigin}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Destination"
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
        />
        <TextInput mode="outlined" label="Dates" value={dates} onChangeText={setDates} style={styles.input} />
        <TextInput
          mode="outlined"
          label="Budget Amount"
          value={budget}
          onChangeText={setBudget}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          mode="outlined"
          label="Currency"
          value={currency}
          onChangeText={setCurrency}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Travelers"
          value={travelers}
          onChangeText={setTravelers}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          mode="outlined"
          label="Travel Style (budget/mid/luxury)"
          value={style}
          onChangeText={setStyle}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Preferences"
          value={preferences}
          onChangeText={setPreferences}
          style={styles.input}
          multiline
          numberOfLines={4}
        />
        <GradientButton title="Generate Itinerary" onPress={handleGenerate} />
        {loading ? <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} /> : null}
        {ready && (
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}
          >
            Your itinerary is ready. Check the Chat tab for details.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  input: {
    marginBottom: 12
  },
  message: {
    marginTop: 12,
    fontSize: 12
  },
  loader: {
    marginTop: 12
  }
});

export default TripPlannerScreen;
