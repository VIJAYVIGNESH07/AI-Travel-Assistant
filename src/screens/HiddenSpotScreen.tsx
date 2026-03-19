import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useTheme } from '../theme/ThemeProvider';
import GradientButton from '../components/atoms/GradientButton';
import OutlineButton from '../components/atoms/OutlineButton';
import MapViewCompat from '../components/molecules/MapViewCompat';
import { useAppSelector } from '../redux/hooks';
import { HIDDEN_SPOT_ADMIN_EMAIL } from '../config/admin';
import { sendHiddenSpotReviewEmail } from '../utils/hiddenSpotMail';
import { addHiddenSpotSubmission } from '../utils/hiddenSpotStorage';

const steps = ['Location', 'Basic', 'Experience', 'Safety', 'Media', 'Review'];

type HiddenSpotMedia = {
  uri: string;
  base64: string;
};

const LOCATION_TYPE_OPTIONS = ['Forest', 'Mountain', 'Beach', 'Urban', 'Other'];
const COUNTRY_OPTIONS = ['India', 'United States', 'United Kingdom', 'Japan', 'Australia', 'Others'];
const SPECIAL_OPTIONS = ['Scenic view', 'Wildlife', 'Historical significance', 'Cultural importance', 'Adventure activities'];
const BEST_SEASON_OPTIONS = ['Spring', 'Summer', 'Monsoon/Rainy', 'Autumn/Fall', 'Winter', 'Year-round'];
const VISIT_DURATION_OPTIONS = ['1-2 hours', 'Half day', 'Full day', 'Multiple days'];
const TRANSPORT_OPTIONS = ['Public transport', 'Private car', 'Walking/Hiking', 'Bicycle', 'Boat/Ferry'];
const DIFFICULTY_OPTIONS = ['Easy (Suitable for all)', 'Moderate (Some physical effort)', 'Hard (Experienced only)'];
const ACCESSIBILITY_OPTIONS = ['Wheelchair accessible', 'Kid-friendly', 'Senior-friendly', 'Clear signage'];
const SAFETY_RATING_OPTIONS = [
  '5 - Very safe',
  '4 - Generally safe',
  '3 - Some concerns',
  '2 - Moderate risk',
  '1 - High risk'
];
const HAZARD_OPTIONS = ['Difficult terrain', 'Wildlife encounters', 'Extreme weather', 'Crime/Theft', 'None significant'];
const SAFETY_EQUIPMENT_OPTIONS = ['First aid kit', 'Extra water', 'Mobile phone', 'Map/GPS', 'Flashlight'];

type HiddenSpotForm = {
  name: string;
  locationType: string;
  country: string;
  specialHighlights: string[];
  bestSeason: string;
  visitDuration: string;
  transportOptions: string[];
  difficulty: string;
  accessibilityFeatures: string[];
  safetyRating: string;
  potentialHazards: string[];
  safetyEquipment: string[];
};

type MultiSelectField =
  | 'specialHighlights'
  | 'transportOptions'
  | 'accessibilityFeatures'
  | 'potentialHazards'
  | 'safetyEquipment';

const HiddenSpotScreen = () => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Bangalore, Karnataka');
  const [coordinates, setCoordinates] = useState({
    latitude: 12.9716,
    longitude: 77.5946
  });
  const [mediaList, setMediaList] = useState<HiddenSpotMedia[]>([]);
  const [form, setForm] = useState<HiddenSpotForm>({
    name: '',
    locationType: 'Forest',
    country: 'India',
    specialHighlights: ['Scenic view'],
    bestSeason: 'Year-round',
    visitDuration: 'Half day',
    transportOptions: ['Public transport'],
    difficulty: 'Easy (Suitable for all)',
    accessibilityFeatures: ['Kid-friendly'],
    safetyRating: '5 - Very safe',
    potentialHazards: ['None significant'],
    safetyEquipment: ['Mobile phone']
  });

  const toggleMultiOption = (key: MultiSelectField, value: string) => {
    setForm((current) => {
      const exists = current[key].includes(value);
      const nextValues = exists ? current[key].filter((item) => item !== value) : [...current[key], value];
      return {
        ...current,
        [key]: nextValues
      };
    });
  };

  const buildDetailsSummary = (data: HiddenSpotForm) =>
    [
      `Location Type: ${data.locationType}`,
      `Country: ${data.country}`,
      `What makes this spot special: ${data.specialHighlights.join(', ')}`,
      `Best season to visit: ${data.bestSeason}`,
      `Recommended visit duration: ${data.visitDuration}`,
      `Transportation options: ${data.transportOptions.join(', ')}`,
      `Difficulty level: ${data.difficulty}`,
      `Accessibility features: ${data.accessibilityFeatures.join(', ')}`,
      `Safety rating: ${data.safetyRating}`,
      `Potential hazards: ${data.potentialHazards.join(', ')}`,
      `Recommended safety equipment: ${data.safetyEquipment.join(', ')}`
    ].join('\n');

  const renderSingleSelect = (
    label: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <View
      style={[
        styles.choiceCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
      ]}
    >
      <Text style={[styles.choiceLabel, { color: theme.colors.textPrimary }]}>{label}</Text>
      <View style={styles.choiceWrap}>
        {options.map((option) => {
          const selected = selectedValue === option;
          return (
            <Pressable
              key={`${label}-${option}`}
              style={[
                styles.choiceChip,
                {
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surface
                }
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.choiceChipText,
                  { color: selected ? theme.colors.white : theme.colors.textSecondary }
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderMultiSelect = (label: string, options: string[], key: MultiSelectField) => (
    <View
      style={[
        styles.choiceCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
      ]}
    >
      <Text style={[styles.choiceLabel, { color: theme.colors.textPrimary }]}>{label}</Text>
      <View style={styles.choiceWrap}>
        {options.map((option) => {
          const selected = form[key].includes(option);
          return (
            <Pressable
              key={`${label}-${option}`}
              style={[
                styles.choiceChip,
                {
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surface
                }
              ]}
              onPress={() => toggleMultiOption(key, option)}
            >
              <Text
                style={[
                  styles.choiceChipText,
                  { color: selected ? theme.colors.white : theme.colors.textSecondary }
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const next = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const back = () => setStep((prev) => Math.max(prev - 1, 0));

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to add media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset?.base64) {
      Alert.alert('Upload failed', 'Unable to read image data. Please try another image.');
      return;
    }

    setMediaList((current) => [...current, { uri: asset.uri, base64: asset.base64! }]);
  };

  const removeMedia = (uri: string) => {
    setMediaList((current) => current.filter((item) => item.uri !== uri));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!locationLabel.trim()) {
        Alert.alert('Missing details', 'Please enter a location label.');
        return false;
      }

      if (Number.isNaN(coordinates.latitude) || Number.isNaN(coordinates.longitude)) {
        Alert.alert('Invalid coordinates', 'Please enter valid latitude and longitude values.');
        return false;
      }
    }

    if (step === 1) {
      if (!form.name.trim()) {
        Alert.alert('Missing details', 'Please enter a spot name.');
        return false;
      }

      if (!form.locationType.trim() || !form.country.trim()) {
        Alert.alert('Missing details', 'Please choose location type and country.');
        return false;
      }
    }

    if (step === 2) {
      if (form.specialHighlights.length === 0 || form.transportOptions.length === 0) {
        Alert.alert('Missing details', 'Please choose special highlights and transport options.');
        return false;
      }
    }

    if (step === 3) {
      if (
        form.accessibilityFeatures.length === 0 ||
        form.potentialHazards.length === 0 ||
        form.safetyEquipment.length === 0
      ) {
        Alert.alert('Missing details', 'Please select at least one option in all safety sections.');
        return false;
      }
    }

    if (step === 4 && mediaList.length === 0) {
      Alert.alert('Media required', 'Please add at least one image.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    next();
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingCurrentLocation(true);

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow location access to use your current GPS location.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const latitude = Number(position.coords.latitude.toFixed(6));
      const longitude = Number(position.coords.longitude.toFixed(6));

      setCoordinates({ latitude, longitude });

      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverse.length > 0) {
        const top = reverse[0];
        const formatted = [top.city, top.region, top.country].filter(Boolean).join(', ');
        if (formatted) {
          setLocationLabel(formatted);
        }
      }

      Alert.alert('Location updated', 'Current GPS location has been applied.');
    } catch {
      Alert.alert('Unable to fetch location', 'Could not fetch current GPS location. Please try again.');
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  const handleMapLocationSelect = async (location: { latitude: number; longitude: number }) => {
    const latitude = Number(location.latitude.toFixed(6));
    const longitude = Number(location.longitude.toFixed(6));
    setCoordinates({ latitude, longitude });
    setLocationLabel(`Lat ${latitude}, Lng ${longitude}`);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        return;
      }

      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverse.length > 0) {
        const top = reverse[0];
        const formatted = [top.city, top.region, top.country].filter(Boolean).join(', ');
        if (formatted) {
          setLocationLabel(formatted);
        }
      }
    } catch {
      // Keep current label when reverse geocode fails.
    }
  };

  const handleSubmitForReview = async () => {
    if (!validateStep()) {
      return;
    }

    const submissionId = `hs-${Date.now()}`;
    const submittedAt = Date.now();
    const detailSummary = buildDetailsSummary(form);

    try {
      setIsSubmitting(true);

      try {
        await addHiddenSpotSubmission({
          id: submissionId,
          submittedBy: user?.name || 'Traveler',
          submittedByHandle: user?.handle || '@traveler',
          submittedAt,
          verify: false,
          status: 'pending',
          name: form.name.trim(),
          locationLabel: locationLabel.trim() || 'Not specified',
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          category: form.locationType.trim(),
          description: detailSummary,
          accessibility: form.accessibilityFeatures.join(', '),
          bestTime: form.bestSeason.trim(),
          imageBase64List: mediaList.map((item) => item.base64),
          adminDecisionAt: null,
          adminNotes: ''
        });
      } catch (dbError) {
        const message = dbError instanceof Error ? dbError.message : 'Database error';
        Alert.alert('Submission failed', `Could not save to database.\n\nReason: ${message}`);
        return;
      }

      try {
        await sendHiddenSpotReviewEmail(HIDDEN_SPOT_ADMIN_EMAIL, {
          submissionId,
          submittedBy: user?.name || 'Traveler',
          submittedByHandle: user?.handle || '@traveler',
          submittedAt,
          name: form.name.trim(),
          category: form.locationType.trim(),
          locationLabel: locationLabel.trim() || 'Not specified',
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          description: detailSummary,
          accessibility: form.accessibilityFeatures.join(', '),
          bestTime: form.bestSeason.trim(),
          mediaCount: mediaList.length
        });
      } catch (emailError) {
        const message = emailError instanceof Error ? emailError.message : 'Email error';
        Alert.alert(
          'Saved but email failed',
          `Submission is saved as pending, but admin notification email failed.\n\nReason: ${message}\n\nThe admin can still review from the app.`
        );
        return;
      }

      Alert.alert('Submitted', 'Hidden spot sent to admin for review and saved as pending.');

      setStep(0);
      setLocationLabel('Bangalore, Karnataka');
      setCoordinates({ latitude: 12.9716, longitude: 77.5946 });
      setMediaList([]);
      setForm({
        name: '',
        locationType: 'Forest',
        country: 'India',
        specialHighlights: ['Scenic view'],
        bestSeason: 'Year-round',
        visitDuration: 'Half day',
        transportOptions: ['Public transport'],
        difficulty: 'Easy (Suitable for all)',
        accessibilityFeatures: ['Kid-friendly'],
        safetyRating: '5 - Very safe',
        potentialHazards: ['None significant'],
        safetyEquipment: ['Mobile phone']
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Pressable
              style={[styles.currentLocationButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={handleUseCurrentLocation}
              disabled={isGettingCurrentLocation}
            >
              <Text style={[styles.currentLocationButtonText, { color: theme.colors.primary }]}>
                {isGettingCurrentLocation ? 'Fetching current location...' : 'Use Current GPS Location'}
              </Text>
            </Pressable>
            <TextInput
              mode="outlined"
              label="Location label"
              value={locationLabel}
              onChangeText={setLocationLabel}
              style={styles.input}
            />
            <View style={styles.coordinateRow}>
              <TextInput
                mode="outlined"
                label="Latitude"
                keyboardType="decimal-pad"
                value={`${coordinates.latitude}`}
                onChangeText={(value) => {
                  const parsed = Number(value);
                  if (!Number.isNaN(parsed)) {
                    setCoordinates((current) => ({ ...current, latitude: parsed }));
                  }
                }}
                style={[styles.input, styles.coordinateInput]}
              />
              <TextInput
                mode="outlined"
                label="Longitude"
                keyboardType="decimal-pad"
                value={`${coordinates.longitude}`}
                onChangeText={(value) => {
                  const parsed = Number(value);
                  if (!Number.isNaN(parsed)) {
                    setCoordinates((current) => ({ ...current, longitude: parsed }));
                  }
                }}
                style={[styles.input, styles.coordinateInput]}
              />
            </View>
            <View style={styles.mapWrap}>
              <MapViewCompat
                style={styles.map}
                initialRegion={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05
                }}
                markers={[
                  {
                    id: 'hidden-spot-marker',
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude
                  }
                ]}
                onPressLocation={handleMapLocationSelect}
                fallbackTitle="Map pinning works on iOS/Android."
                fallbackBody="Tap on map to pick location. You can also use GPS or type manually."
              />
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Basic Details</Text>
            <TextInput
              mode="outlined"
              label="Spot name"
              value={form.name}
              onChangeText={(value) => setForm({ ...form, name: value })}
              style={styles.input}
            />
            {renderSingleSelect('Location type', LOCATION_TYPE_OPTIONS, form.locationType, (value) =>
              setForm((current) => ({ ...current, locationType: value }))
            )}
            {renderSingleSelect('Country', COUNTRY_OPTIONS, form.country, (value) =>
              setForm((current) => ({ ...current, country: value }))
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Experience Details</Text>
            {renderMultiSelect('What makes this spot special?', SPECIAL_OPTIONS, 'specialHighlights')}
            {renderSingleSelect('Best season to visit', BEST_SEASON_OPTIONS, form.bestSeason, (value) =>
              setForm((current) => ({ ...current, bestSeason: value }))
            )}
            {renderSingleSelect('Recommended visit duration', VISIT_DURATION_OPTIONS, form.visitDuration, (value) =>
              setForm((current) => ({ ...current, visitDuration: value }))
            )}
            {renderMultiSelect('Transportation options', TRANSPORT_OPTIONS, 'transportOptions')}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Safety Details</Text>
            {renderSingleSelect('Difficulty level', DIFFICULTY_OPTIONS, form.difficulty, (value) =>
              setForm((current) => ({ ...current, difficulty: value }))
            )}
            {renderMultiSelect('Accessibility features', ACCESSIBILITY_OPTIONS, 'accessibilityFeatures')}
            {renderSingleSelect('Safety rating', SAFETY_RATING_OPTIONS, form.safetyRating, (value) =>
              setForm((current) => ({ ...current, safetyRating: value }))
            )}
            {renderMultiSelect('Potential hazards', HAZARD_OPTIONS, 'potentialHazards')}
            {renderMultiSelect('Recommended safety equipment', SAFETY_EQUIPMENT_OPTIONS, 'safetyEquipment')}
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Upload Media</Text>
            <Pressable
              style={[styles.addMediaButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={handlePickImage}
            >
              <Text style={[styles.addMediaText, { color: theme.colors.primary }]}>Add Image</Text>
            </Pressable>
            <View style={styles.mediaGrid}>
              {mediaList.map((item) => (
                <View key={item.uri} style={styles.mediaItemWrap}>
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} contentFit="cover" />
                  <Pressable style={styles.mediaRemove} onPress={() => removeMedia(item.uri)}>
                    <Text style={styles.mediaRemoveText}>x</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Review</Text>
            <View style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Name: {form.name || 'Untitled spot'}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Location: {locationLabel || 'Not specified'}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Coordinates: {coordinates.latitude}, {coordinates.longitude}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Location type: {form.locationType}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Country: {form.country}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Special highlights: {form.specialHighlights.join(', ')}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Best season: {form.bestSeason}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Visit duration: {form.visitDuration}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Transportation: {form.transportOptions.join(', ')}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Difficulty: {form.difficulty}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Accessibility: {form.accessibilityFeatures.join(', ')}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Safety rating: {form.safetyRating}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Potential hazards: {form.potentialHazards.join(', ')}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Recommended safety equipment: {form.safetyEquipment.join(', ')}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Media count: {mediaList.length}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          {step > 0 ? <OutlineButton title="Back" onPress={back} /> : <View />}
          <GradientButton
            title={step === steps.length - 1 ? (isSubmitting ? 'Sending...' : 'Submit for Admin Review') : 'Next'}
            onPress={step === steps.length - 1 ? handleSubmitForReview : handleNext}
          />
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
    fontSize: 10,
    textAlign: 'center'
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600'
  },
  currentLocationButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  currentLocationButtonText: {
    fontSize: 13,
    fontWeight: '700'
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
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  coordinateInput: {
    flex: 1
  },
  choiceCard: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12
  },
  choiceLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  choiceChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 34,
    justifyContent: 'center'
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  addMediaButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  addMediaText: {
    fontSize: 13,
    fontWeight: '700'
  },
  mediaGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  mediaItemWrap: {
    width: '31%',
    position: 'relative'
  },
  mediaImage: {
    width: '100%',
    height: 90,
    borderRadius: 12,
  },
  mediaRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mediaRemoveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16
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

