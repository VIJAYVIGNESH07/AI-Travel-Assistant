import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '../../theme/ThemeProvider';
import { formatCount } from '../../utils/format';

type Post = {
  id: string;
  user: string;
  handle: string;
  location: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
};

type Props = {
  post: Post;
  liked?: boolean;
  onLikePress?: () => void;
  onOpenPress?: () => void;
};

const PostCard = ({ post, liked = false, onLikePress, onOpenPress }: Props) => {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadows.level2]}
    >
      <Pressable onPress={onOpenPress}>
        <Image source={{ uri: post.image }} style={styles.image} />
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.user, { color: theme.colors.textPrimary }]}>{post.user}</Text>
        <Text style={[styles.location, { color: theme.colors.textSecondary }]}>{post.location}</Text>
        <Text style={[styles.caption, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {post.caption}
        </Text>
        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={onLikePress}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={theme.colors.accent} />
            <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>{formatCount(post.likes)}</Text>
          </Pressable>
          <Pressable style={styles.action}>
            <Ionicons name="chatbubble" size={16} color={theme.colors.blue} />
            <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>{formatCount(post.comments)}</Text>
          </Pressable>
          <Pressable style={styles.action}>
            <Ionicons name="share" size={16} color={theme.colors.slate500} />
            <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>Share</Text>
          </Pressable>
          <Pressable style={styles.action}>
            <Ionicons name="bookmark" size={16} color={theme.colors.slate500} />
          </Pressable>
        </View>
      </View>
    </View>
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
    height: 200
  },
  content: {
    padding: 16
  },
  user: {
    fontSize: 16,
    fontWeight: '700'
  },
  location: {
    fontSize: 12,
    marginTop: 4
  },
  caption: {
    marginTop: 8,
    fontSize: 14
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  actionText: {
    marginLeft: 6,
    fontSize: 12
  }
});

export default PostCard;
