import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, Text } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import type { MapMarkerItem, MapRegion, MapPressLocation } from './MapViewCompat.types';

type MapViewCompatProps = {
  style?: StyleProp<ViewStyle>;
  initialRegion: MapRegion;
  markers: MapMarkerItem[];
  fallbackTitle?: string;
  fallbackBody?: string;
  onPressLocation?: (location: MapPressLocation) => void;
};

const buildMapHtml = (initialRegion: MapRegion, markers: MapMarkerItem[]) => {
  const safeMarkers = markers.length
    ? markers.map((item) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        title: item.title || ''
      }))
    : [
        {
          id: 'center',
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
          title: 'Selected location'
        }
      ];

  const mapCenter = safeMarkers[0];
  const markersJson = JSON.stringify(safeMarkers);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const markers = ${markersJson};
      const map = L.map('map', { zoomControl: true }).setView([${mapCenter.latitude}, ${mapCenter.longitude}], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markers.forEach((item) => {
        const marker = L.marker([item.latitude, item.longitude]).addTo(map);
        if (item.title) {
          marker.bindPopup(item.title);
        }
      });

      let selectedMarker = null;
      map.on('click', function (event) {
        const latitude = Number(event.latlng.lat.toFixed(6));
        const longitude = Number(event.latlng.lng.toFixed(6));

        if (selectedMarker) {
          map.removeLayer(selectedMarker);
        }

        selectedMarker = L.marker([latitude, longitude]).addTo(map);

        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'map-press', latitude, longitude })
          );
        }
      });
    </script>
  </body>
</html>`;
};

const MapViewCompat = ({ style, initialRegion, markers, fallbackTitle, fallbackBody, onPressLocation }: MapViewCompatProps) => {
  const html = buildMapHtml(initialRegion, markers);

  const handleMessage = (event: WebViewMessageEvent) => {
    if (!onPressLocation) {
      return;
    }

    try {
      const payload = JSON.parse(event.nativeEvent.data || '{}');
      if (
        payload?.type === 'map-press' &&
        typeof payload.latitude === 'number' &&
        typeof payload.longitude === 'number'
      ) {
        onPressLocation({
          latitude: payload.latitude,
          longitude: payload.longitude
        });
      }
    } catch {
      // Ignore invalid bridge payloads.
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        startInLoadingState
        onMessage={handleMessage}
      />
      <View style={styles.hintWrap}>
        <Text style={styles.hintTitle}>{fallbackTitle || 'Interactive map preview'}</Text>
        <Text style={styles.hintBody}>{fallbackBody || 'Tap a point to select location.'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  hintWrap: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: 180
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: '700'
  },
  hintBody: {
    marginTop: 2,
    fontSize: 10,
    color: '#334155'
  }
});

export default MapViewCompat;
