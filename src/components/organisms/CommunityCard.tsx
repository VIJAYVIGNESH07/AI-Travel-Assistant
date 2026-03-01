import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../theme/ThemeProvider';
import GradientButton from '../atoms/GradientButton';
import OutlineButton from '../atoms/OutlineButton';

type Community = {
  id: string;
  name: string;
  members: string;
  online: string;
  description: string;
  joined: boolean;
  image: string;
};

type Props = {
  community: Community;
  onPress?: () => void;
};

const CommunityCard = ({ community, onPress }: Props) => {
  const theme = useTheme();
  return (
    <Pressable style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadows.level2]} onPress={onPress}
    >
      <Image source={{ uri: community.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{community.name}</Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          {community.members} members, {community.online} online
        </Text>
        <Text style={[styles.description, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {community.description}
        </Text>
        {community.joined ? (
          <OutlineButton title="View Posts" />
        ) : (
          <GradientButton title="Join Community" />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16
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
    marginTop: 4,
    fontSize: 12
  },
  description: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 13
  }
});

export default CommunityCard;
