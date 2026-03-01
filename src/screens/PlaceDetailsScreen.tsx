import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { places } from '../data/mock';

const PlaceDetailsScreen = () => {
  const theme = useTheme();
  const route = useRoute<any>();
  const place = places.find((item) => item.id === route.params?.id) || places[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView>
        <Image source={{ uri: place.image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{place.name}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{place.location}</Text>
          <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>
            Rating {place.rating} ({place.reviews} reviews)
          </Text>
          <Text style={[styles.description, { color: theme.colors.textPrimary }]}>
            {place.description}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  image: {
    width: '100%',
    height: 240
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12
  },
  detail: {
    marginTop: 8,
    fontSize: 12
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20
  }
});

export default PlaceDetailsScreen;
