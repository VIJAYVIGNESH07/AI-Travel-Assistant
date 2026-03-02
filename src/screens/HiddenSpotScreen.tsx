import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoLinking from 'expo-linking';
import { Image } from 'expo-image';
import { useTheme } from '../theme/ThemeProvider';
import GradientButton from '../components/atoms/GradientButton';
import OutlineButton from '../components/atoms/OutlineButton';
import MapViewCompat from '../components/molecules/MapViewCompat';
import { useAppSelector } from '../redux/hooks';
import { HIDDEN_SPOT_ADMIN_EMAIL } from '../config/admin';
import { sendHiddenSpotReviewEmail } from '../utils/hiddenSpotMail';
import { addHiddenSpotSubmission } from '../utils/hiddenSpotStorage';

const steps = ['Location', 'Details', 'Media', 'Review'];

type HiddenSpotMedia = {
  uri: string;
  base64: string;
};

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
  const [form, setForm] = useState({
    name: '',
    category: 'Nature',
    description: '',
    accessibility: '',
    bestTime: ''
  });

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

      if (!form.category.trim()) {
        Alert.alert('Missing details', 'Please enter a category.');
        return false;
      }

      if (!form.description.trim() || form.description.trim().length < 20) {
        Alert.alert('Missing details', 'Please enter a description with at least 20 characters.');
        return false;
      }
    }

    if (step === 2 && mediaList.length === 0) {
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

  const handleSubmitForReview = async () => {
    if (!validateStep()) {
      return;
    }

    const submissionId = `hs-${Date.now()}`;
    const submittedAt = Date.now();

    try {
      setIsSubmitting(true);

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
        category: form.category.trim(),
        description: form.description.trim(),
        accessibility: form.accessibility.trim(),
        bestTime: form.bestTime.trim(),
        imageBase64List: mediaList.map((item) => item.base64),
        adminDecisionAt: null,
        adminNotes: ''
      });

      await sendHiddenSpotReviewEmail(HIDDEN_SPOT_ADMIN_EMAIL, {
        submissionId,
        submittedBy: user?.name || 'Traveler',
        submittedByHandle: user?.handle || '@traveler',
        submittedAt,
        name: form.name.trim(),
        category: form.category.trim(),
        locationLabel: locationLabel.trim() || 'Not specified',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        description: form.description.trim(),
        accessibility: form.accessibility.trim(),
        bestTime: form.bestTime.trim(),
        mediaCount: mediaList.length,
        approveUrl: ExpoLinking.createURL('admin-hidden-spot-review', {
          queryParams: {
            submissionId,
            action: 'approved'
          }
        }),
        rejectUrl: ExpoLinking.createURL('admin-hidden-spot-review', {
          queryParams: {
            submissionId,
            action: 'rejected'
          }
        })
      });

      Alert.alert('Submitted', 'Hidden spot sent to admin for review and saved as pending.');

      setStep(0);
      setLocationLabel('Bangalore, Karnataka');
      setCoordinates({ latitude: 12.9716, longitude: 77.5946 });
      setMediaList([]);
      setForm({
        name: '',
        category: 'Nature',
        description: '',
        accessibility: '',
        bestTime: ''
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown SendGrid error';
      Alert.alert(
        'Email sending failed',
        `Submission is saved as pending, but admin email failed.\n\nReason: ${message}`
      );
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
                fallbackTitle="Map pinning works on iOS/Android."
                fallbackBody="Continue with the form details on web."
              />
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
                    <Text style={styles.mediaRemoveText}>×</Text>
                  </Pressable>
                </View>
              ))}
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
                Location: {locationLabel || 'Not specified'}
              </Text>
              <Text style={[styles.reviewText, { color: theme.colors.textPrimary }]}>
                Coordinates: {coordinates.latitude}, {coordinates.longitude}
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
    fontSize: 10
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
