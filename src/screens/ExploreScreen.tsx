import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, Alert, Linking, ScrollView, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { exploreFilters, places } from '../data/mock';
import SearchBar from '../components/molecules/SearchBar';
import Chip from '../components/atoms/Chip';
import type { RootStackParamList } from '../navigation/types';

const ExploreScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?.id || '');

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let filtered = [...places];

    if (activeFilter === 'Recent') {
      filtered = [...places].slice(0, 5);
    } else if (activeFilter === 'New') {
      filtered = [...places].slice(-5).reverse();
    }

    if (!normalizedQuery) {
      return filtered;
    }

    return filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.location.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        (item.description || '').toLowerCase().includes(normalizedQuery)
    );
  }, [activeFilter, query]);

  useEffect(() => {
    if (filteredPlaces.length === 0) {
      setSelectedPlaceId('');
      return;
    }

    const hasSelected = filteredPlaces.some((item) => item.id === selectedPlaceId);
    if (!hasSelected) {
      setSelectedPlaceId(filteredPlaces[0].id);
    }
  }, [filteredPlaces, selectedPlaceId]);

  const selectedPlace = filteredPlaces.find((item) => item.id === selectedPlaceId) || filteredPlaces[0] || null;
  const mapCenter = selectedPlace || filteredPlaces[0] || places[0];

  const handleOpenVR = async () => {
    if (!selectedPlace?.vrLink) {
      return;
    }

    const canOpen = await Linking.canOpenURL(selectedPlace.vrLink);
    if (!canOpen) {
      Alert.alert('Unable to open', 'VR link is not available on this device.');
      return;
    }

    await Linking.openURL(selectedPlace.vrLink);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.searchRow}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search destinations" />
      </View>

      <View style={styles.filters}>
        {exploreFilters.map((filter) => (
          <Chip key={filter} label={filter} selected={filter === activeFilter} onPress={() => setActiveFilter(filter)} />
        ))}
      </View>

      {selectedPlace ? (
        <View style={[styles.listContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>Places</Text>

          <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {filteredPlaces.map((item) => {
              const isSelected = item.id === selectedPlace.id;

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.background,
                      borderColor: theme.colors.border
                    }
                  ]}
                  onPress={() => setSelectedPlaceId(item.id)}
                >
                  <Text
                    style={[
                      styles.listItemText,
                      { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary }
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
              onPress={() => navigation.navigate('PlaceDetails', { id: selectedPlace.id })}
            >
              <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>View Details</Text>
            </Pressable>

            <Pressable style={[styles.actionButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]} onPress={handleOpenVR}>
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>View in VR</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No places match your search.</Text>
        </View>
      )}

      <View style={styles.mapWrap}>
        <View style={[styles.mapCard, { borderColor: theme.colors.border }]}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: mapCenter.latitude,
              longitude: mapCenter.longitude,
              latitudeDelta: 5,
              longitudeDelta: 5
            }}
          >
            {filteredPlaces.map((item) => (
              <Marker
                key={item.id}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                title={item.name}
                onPress={() => setSelectedPlaceId(item.id)}
              />
            ))}
          </MapView>
          <View style={styles.mapHint}>
            <Text style={[styles.mapHintText, { color: theme.colors.textSecondary }]}>
              {filteredPlaces.length > 0 ? 'Interactive map' : 'No places found'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchRow: {
    paddingHorizontal: 20,
    paddingTop: 8
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  listContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    maxHeight: 260
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  listScroll: {
    marginTop: 12
  },
  listContent: {
    gap: 8,
    paddingBottom: 12
  },
  listItem: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '600'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700'
  },
  mapWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12
  },
  mapCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  mapHint: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  mapHintText: {
    fontSize: 11,
    fontWeight: '600'
  },
  emptyState: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600'
  }
});

export default ExploreScreen;
