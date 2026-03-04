import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { MapMarkerItem, MapRegion } from './MapViewCompat.types';

type MapViewCompatProps = {
    style?: StyleProp<ViewStyle>;
    initialRegion: MapRegion;
    markers: MapMarkerItem[];
    fallbackTitle?: string;
    fallbackBody?: string;
};

const MapViewCompat = ({ style, fallbackTitle, fallbackBody }: MapViewCompatProps) => {
    const theme = useTheme();

    return (
        <View style={[styles.fallback, { backgroundColor: theme.colors.background }, style]}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                {fallbackTitle || 'Map is available on iOS/Android.'}
            </Text>
            <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
                {fallbackBody || 'Use the list controls on web.'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    fallback: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center'
    },
    body: {
        marginTop: 8,
        fontSize: 12,
        textAlign: 'center'
    }
});

export default MapViewCompat;
