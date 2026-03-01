import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import OutlineButton from '../atoms/OutlineButton';

const GuideCard = ({ guide }: { guide: any }) => {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadows.level2]}>
      <View style={styles.header}>
        <Image source={{ uri: guide.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{guide.name}</Text>
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            {guide.location} | {guide.languages}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={theme.colors.accent} />
            <Text style={[styles.meta, { color: theme.colors.textSecondary }]}> {guide.rating} ({guide.reviews})</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
        Experience: {guide.experience}
      </Text>
      <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
        Specialties: {guide.specialties.join(', ')}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.price, { color: theme.colors.textPrimary }]}>{guide.price}</Text>
        <OutlineButton title="View" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12
  },
  info: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '700'
  },
  meta: {
    fontSize: 12,
    marginTop: 4
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12
  },
  price: {
    fontSize: 14,
    fontWeight: '600'
  }
});

export default GuideCard;
