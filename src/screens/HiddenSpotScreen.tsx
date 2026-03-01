import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { useTheme } from '../theme/ThemeProvider';
import GradientButton from '../components/atoms/GradientButton';
import OutlineButton from '../components/atoms/OutlineButton';

const steps = ['Location', 'Details', 'Media', 'Review'];

const HiddenSpotScreen = () => {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    category: 'Nature',
    description: '',
    accessibility: '',
    bestTime: ''
  });

  const next = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const back = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Add Hidden Spot</Text>

        <View style={styles.stepRow}>
          {steps.map((label, index) => (
            <View key={label} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  { backgroundColor: index === step ? theme.colors.primary : theme.colors.slate400 }
                ]}
              />
              <Text style={[styles.stepLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>

        {step === 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Pin Location on Map</Text>
            <View style={styles.mapWrap}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 12.9716,
                  longitude: 77.5946,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05
                }}
              >
                <Marker coordinate={{ latitude: 12.9716, longitude: 77.5946 }} />
              </MapView>
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <TextInput
              mode="outlined"
              label="Spot name"
              value={form.name}
              onChangeText={(value) => setForm({ ...form, name: value })}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Category"
              value={form.category}
              onChangeText={(value) => setForm({ ...form, category: value })}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Description"
              value={form.description}
              onChangeText={(value) => setForm({ ...form, description: value })}
              style={styles.input}
              multiline
              numberOfLines={4}
            />
            <TextInput
              mode="outlined"
              label="Accessibility"
              value={form.accessibility}
              onChangeText={(value) => setForm({ ...form, accessibility: value })}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Best time to visit"
              value={form.bestTime}
              onChangeText={(value) => setForm({ ...form, bestTime: value })}
              style={styles.input}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Upload Media</Text>
            <View style={styles.mediaRow}>
              <View style={[styles.mediaBox, { borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.textSecondary }}>Add Photo</Text>
              </View>
              <View style={[styles.mediaBox, { borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.textSecondary }}>Add Photo</Text>
              </View>
              <View style={[styles.mediaBox, { borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.textSecondary }}>Add Video</Text>
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Review</Text>
            <View style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Name: {form.name || 'Untitled spot'}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Category: {form.category}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Description: {form.description || 'No description'}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Accessibility: {form.accessibility || 'Not specified'}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Best time: {form.bestTime || 'Not specified'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          {step > 0 ? <OutlineButton title="Back" onPress={back} /> : <View />}
          <GradientButton title={step === steps.length - 1 ? 'Submit' : 'Next'} onPress={next} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  title: {
    fontSize: 20,
    fontWeight: '700'
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  stepItem: {
    alignItems: 'center',
    flex: 1
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6
  },
  stepLabel: {
    fontSize: 10
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600'
  },
  mapWrap: {
    marginTop: 12,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  input: {
    marginTop: 12
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  mediaBox: {
    width: '31%',
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12
  },
  reviewText: {
    fontSize: 13,
    marginBottom: 6
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

export default HiddenSpotScreen;
