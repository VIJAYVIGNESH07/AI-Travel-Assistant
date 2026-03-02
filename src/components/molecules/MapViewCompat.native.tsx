import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { MapMarkerItem, MapRegion } from './MapViewCompat.types';

type MapViewCompatProps = {
  style?: StyleProp<ViewStyle>;
  initialRegion: MapRegion;
  markers: MapMarkerItem[];
};

const MapViewCompat = ({ style, initialRegion, markers }: MapViewCompatProps) => {
  return (
    <MapView style={[styles.map, style]} initialRegion={initialRegion}>
      {markers.map((item) => (
        <Marker
          key={item.id}
          coordinate={{ latitude: item.latitude, longitude: item.longitude }}
          title={item.title}
          onPress={item.onPress}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%'
  }
});

export default MapViewCompat;
