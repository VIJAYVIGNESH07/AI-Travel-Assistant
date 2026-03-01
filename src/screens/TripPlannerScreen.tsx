import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { useTheme } from '../theme/ThemeProvider';
import GradientButton from '../components/atoms/GradientButton';

const TripPlannerScreen = () => {
  const theme = useTheme();
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [preferences, setPreferences] = useState('');
  const [ready, setReady] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Plan New Trip</Text>
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
          label="Preferences"
          value={preferences}
          onChangeText={setPreferences}
          style={styles.input}
          multiline
          numberOfLines={4}
        />
        <GradientButton title="Generate Itinerary" onPress={() => setReady(true)} />
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
  }
});

export default TripPlannerScreen;
