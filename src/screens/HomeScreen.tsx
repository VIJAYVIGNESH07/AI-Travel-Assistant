import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { posts as staticPosts, stories as staticStories } from '../data/mock';
import StoryAvatar from '../components/atoms/StoryAvatar';
import PostCard from '../components/organisms/PostCard';
import type { RootStackParamList } from '../navigation/types';
import {
  getStoredPosts,
  getStoredStories,
  toImageDataUri,
  getPostInteraction,
  togglePostLike,
  addPostComment,
  incrementPostShare,
  StoredComment
} from '../utils/socialStorage';
import { useAppSelector } from '../redux/hooks';

type HomeStory = {
  id: string;
  name: string;
  image: string;
  seen: boolean;
  isAdd: boolean;
};

type HomePost = {
  id: string;
  user: string;
  handle: string;
  location: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  commentsList: StoredComment[];
  isStored: boolean;
};

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAppSelector((state) => state.auth.user);
  const [homeStories, setHomeStories] = useState<HomeStory[]>([]);
  const [homePosts, setHomePosts] = useState<HomePost[]>([]);
  const [ownStoryId, setOwnStoryId] = useState('');
  const [ownStoryUris, setOwnStoryUris] = useState<string[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<HomePost | null>(null);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState('');
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);

  const loadSocialData = useCallback(async () => {
    const storedStories = await getStoredStories();
    const storedPosts = await getStoredPosts();
    const currentUserName = user?.name || 'Your Story';
    const ownStories = storedStories.filter((story) => story.name === currentUserName);
    const otherStories = storedStories.filter((story) => story.name !== currentUserName);

    const uploadedStories = otherStories.map((story) => ({
      id: story.id,
      name: story.name,
      image: toImageDataUri(story.imageBase64),
      seen: story.seen,
      isAdd: story.isAdd
    }));

    const baseStaticStories = staticStories.slice(1).map((story) => ({
      id: `static-${story.id}`,
      name: story.name,
      image: story.image,
      seen: story.seen,
      isAdd: false
    }));

    const uploadedPosts = storedPosts.map((post) => ({
      id: post.id,
      user: post.user,
      handle: post.handle,
      location: post.location,
      image: toImageDataUri(post.imageBase64),
      caption: post.caption,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares || 0,
      commentsList: [],
      isStored: true
    }));

    const baseFeedPosts: HomePost[] = staticPosts.map((post) => ({
      id: post.id,
      user: post.user,
      handle: post.handle,
      location: post.location,
      image: post.image,
      caption: post.caption,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares || 0,
      commentsList: [],
      isStored: false
    }));

    const mergedPosts = [...uploadedPosts, ...baseFeedPosts];
    const interactionStates = await Promise.all(
      mergedPosts.map((post) =>
        getPostInteraction(post.id, {
          likes: post.likes,
          comments: post.comments,
          shares: post.shares
        })
      )
    );

    const nextLiked = interactionStates
      .map((state, index) => (state.likedByMe ? mergedPosts[index].id : ''))
      .filter(Boolean);

    const hydratedPosts = mergedPosts.map((post, index) => ({
      ...post,
      likes: interactionStates[index].likes,
      comments: interactionStates[index].comments,
      shares: interactionStates[index].shares,
      commentsList: interactionStates[index].commentsList
    }));

    if (ownStories.length > 0) {
      const ownUris = ownStories.map((story) => toImageDataUri(story.imageBase64));
      setOwnStoryId('own-story');
      setOwnStoryUris(ownUris);
      setHomeStories([
        {
          id: 'own-story',
          name: 'Your Story',
          image: ownUris[0],
          seen: false,
          isAdd: false
        },
        ...baseStaticStories,
        ...uploadedStories
      ]);
    } else {
      setOwnStoryId('');
      setOwnStoryUris([]);
      setCurrentStoryIndex(0);
      setHomeStories([
        {
          id: 'static-add-story',
          name: 'Your Story',
          image: staticStories[0]?.image || '',
          seen: false,
          isAdd: true
        },
        ...baseStaticStories,
        ...uploadedStories
      ]);
    }

    setLikedPostIds(nextLiked as string[]);
    setHomePosts(hydratedPosts);
  }, [user?.name]);

  useFocusEffect(
    useCallback(() => {
      loadSocialData();
    }, [loadSocialData])
  );

  useEffect(() => {
    if (!storyViewerVisible || ownStoryUris.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStoryIndex((current) => {
        if (current >= ownStoryUris.length - 1) {
          setStoryViewerVisible(false);
          return 0;
        }

        return current + 1;
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [storyViewerVisible, ownStoryUris.length, currentStoryIndex]);

  const handleOpenPost = (post: HomePost) => {
    setSelectedPost(post);
    setPostViewerVisible(true);
  };

  const handleLikePost = async (post: HomePost) => {
    const next = await togglePostLike(post.id, {
      likes: post.likes,
      comments: post.comments,
      shares: post.shares
    });

    setLikedPostIds((current) => {
      if (next.likedByMe) {
        return current.includes(post.id) ? current : [...current, post.id];
      }
      return current.filter((id) => id !== post.id);
    });

    setHomePosts((current) =>
      current.map((item) => {
        if (item.id !== post.id) {
          return item;
        }

        return {
          ...item,
          likes: next.likes
        };
      })
    );

    if (selectedPost?.id === post.id) {
      setSelectedPost((current) => (current ? { ...current, likes: next.likes } : current));
    }
  };

  const handleOpenComments = (post: HomePost) => {
    setActiveCommentPostId(post.id);
    setCommentText('');
    setCommentModalVisible(true);
  };

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text || !activeCommentPostId) {
      return;
    }

    const activePost = homePosts.find((post) => post.id === activeCommentPostId);
    if (!activePost) {
      return;
    }

    const next = await addPostComment(
      activeCommentPostId,
      text,
      user?.name || 'Traveler',
      {
        likes: activePost.likes,
        comments: activePost.comments,
        shares: activePost.shares
      }
    );

    setHomePosts((current) =>
      current.map((item) => {
        if (item.id !== activeCommentPostId) {
          return item;
        }

        return {
          ...item,
          comments: next.comments,
          commentsList: next.commentsList
        };
      })
    );

    setCommentText('');
  };

  const handleSharePost = async (post: HomePost) => {
    try {
      await Share.share({
        message: `${post.user} shared this travel moment: ${post.caption}`
      });

      const next = await incrementPostShare(post.id, {
        likes: post.likes,
        comments: post.comments,
        shares: post.shares
      });

      setHomePosts((current) =>
        current.map((item) => {
          if (item.id !== post.id) {
            return item;
          }

          return {
            ...item,
            shares: next.shares
          };
        })
      );
    } catch {
      Alert.alert('Share failed', 'Unable to share this post right now.');
    }
  };

  const activeCommentPost = homePosts.find((post) => post.id === activeCommentPostId) || null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>WanderMate</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={20} color={theme.colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={homePosts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <FlatList
              data={homeStories}
              horizontal
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <StoryAvatar
                  name={item.name}
                  image={item.image}
                  seen={item.seen}
                  isAdd={item.isAdd}
                  onPress={() => {
                    if (item.id === ownStoryId && ownStoryUris.length > 0) {
                      setCurrentStoryIndex(0);
                      setStoryViewerVisible(true);
                      return;
                    }

                    if (item.isAdd) {
                      navigation.navigate('UploadStory');
                    }
                  }}
                />
              )}
              contentContainerStyle={styles.storyList}
            />
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Latest Stories</Text>
              <View style={styles.headerLinks}>
                <Pressable onPress={() => navigation.navigate('HiddenSpotList')}>
                  <Text style={[styles.link, { color: theme.colors.primary }]}>Hidden Spots</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Community')}>
                  <Text style={[styles.link, { color: theme.colors.primary }]}>Communities</Text>
                </Pressable>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            liked={likedPostIds.includes(item.id)}
            onOpenPress={() => handleOpenPost(item)}
            onLikePress={() => handleLikePost(item)}
            onCommentPress={() => handleOpenComments(item)}
            onSharePress={() => handleSharePost(item)}
          />
        )}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={storyViewerVisible} transparent={false} animationType="fade">
        <View style={styles.storyViewer}>
          {ownStoryUris[currentStoryIndex] ? (
            <Image source={{ uri: ownStoryUris[currentStoryIndex] }} style={styles.storyViewerImage} contentFit="cover" />
          ) : null}
          <Pressable
            style={styles.backButton}
            onPress={() => {
              setStoryViewerVisible(false);
              setCurrentStoryIndex(0);
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>

      <Modal visible={postViewerVisible} transparent={false} animationType="fade">
        <View style={styles.postViewer}>
          {selectedPost ? <Image source={{ uri: selectedPost.image }} style={styles.postViewerImage} contentFit="contain" /> : null}
          <Pressable style={styles.backButton} onPress={() => setPostViewerVisible(false)}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>

      <Modal visible={commentModalVisible} transparent animationType="slide">
        <View style={styles.commentModalBackdrop}>
          <View style={[styles.commentSheet, { backgroundColor: theme.colors.surface }]}> 
            <Text style={[styles.commentTitle, { color: theme.colors.textPrimary }]}>Comments</Text>
            <FlatList
              data={activeCommentPost?.commentsList || []}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={[styles.emptyComments, { color: theme.colors.textSecondary }]}>No comments yet.</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <Text style={[styles.commentUser, { color: theme.colors.textPrimary }]}>{item.user}</Text>
                  <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>{item.text}</Text>
                </View>
              )}
              style={styles.commentsList}
            />
            <TextInput
              mode="outlined"
              label="Add a comment"
              value={commentText}
              onChangeText={setCommentText}
            />
            <View style={styles.commentActions}>
              <Pressable onPress={() => setCommentModalVisible(false)}>
                <Text style={[styles.commentActionText, { color: theme.colors.textSecondary }]}>Close</Text>
              </Pressable>
              <Pressable onPress={handleSubmitComment}>
                <Text style={[styles.commentActionText, { color: theme.colors.primary }]}>Post</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '700'
  },
  headerActions: {
    flexDirection: 'row'
  },
  iconButton: {
    marginLeft: 12
  },
  storyList: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12
  },
  headerLinks: {
    flexDirection: 'row',
    gap: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  link: {
    fontSize: 13,
    fontWeight: '600'
  },
  feed: {
    paddingHorizontal: 20,
    paddingBottom: 100
  },
  storyViewer: {
    flex: 1,
    backgroundColor: '#000000'
  },
  storyViewerImage: {
    width: '100%',
    height: '100%'
  },
  postViewer: {
    flex: 1,
    backgroundColor: '#000000'
  },
  postViewerImage: {
    width: '100%',
    height: '100%'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  commentSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: '65%'
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  commentsList: {
    marginVertical: 10,
    maxHeight: 220
  },
  emptyComments: {
    paddingVertical: 10,
    fontSize: 13
  },
  commentRow: {
    marginBottom: 10
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '700'
  },
  commentText: {
    marginTop: 2,
    fontSize: 13
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  commentActionText: {
    fontSize: 14,
    fontWeight: '700'
  }
});

export default HomeScreen;
