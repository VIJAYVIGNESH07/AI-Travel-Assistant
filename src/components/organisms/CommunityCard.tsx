import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../theme/ThemeProvider';
import GradientButton from '../atoms/GradientButton';

type Community = {
  id: string;
  name: string;
  members: string;
  online: string;
  description: string;
  joined: boolean;
  image: string;
};

export type CommunityPost = {
  id: string;
  image: string;
  caption: string;
};

type Props = {
  community: Community;
  onPress?: () => void;
  onViewPress?: () => void;
  posts?: CommunityPost[];
  showPosts?: boolean;
};

const CommunityCard = ({ community, onPress, onViewPress, posts = [], showPosts = false }: Props) => {
  const theme = useTheme();

  return (
    <Pressable style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadows.level2]} onPress={onPress}>
      <Image source={{ uri: community.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{community.name}</Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          {community.members} members, {community.online} online
        </Text>
        <Text style={[styles.description, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {community.description}
        </Text>

        <GradientButton title="View Community" onPress={onViewPress} />

        {showPosts && posts.length > 0 ? (
          <View style={[styles.postsWrap, { borderColor: theme.colors.border }]}>
            <Text style={[styles.postsTitle, { color: theme.colors.textPrimary }]}>Community Posts</Text>
            {posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <Image source={{ uri: post.image }} style={styles.postImage} contentFit="cover" />
                <Text style={[styles.postCaption, { color: theme.colors.textSecondary }]}>{post.caption}</Text>
              </View>
            ))}
          </View>
        ) : null}
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
  },
  postsWrap: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 10
  },
  postsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8
  },
  postCard: {
    marginBottom: 10
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 10
  },
  postCaption: {
    marginTop: 6,
    fontSize: 12
  }
});

export default CommunityCard;
