import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../theme/ThemeProvider';
import GradientButton from '../atoms/GradientButton';
import OutlineButton from '../atoms/OutlineButton';

type Props = {
  place: any;
  onViewDetails?: () => void;
  onViewAR?: () => void;
};

const PlaceCard = ({ place, onViewDetails, onViewAR }: Props) => {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadows.level3]}>
      <Image source={{ uri: place.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{place.name}</Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          {place.location} | {place.rating} ({place.reviews})
        </Text>
        <View style={styles.actions}>
          <GradientButton title="View in AR" onPress={onViewAR} />
          <OutlineButton title="Details" onPress={onViewDetails} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 140
  },
  body: {
    padding: 16
  },
  name: {
    fontSize: 16,
    fontWeight: '700'
  },
  meta: {
    fontSize: 12,
    marginTop: 4
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

export default PlaceCard;
