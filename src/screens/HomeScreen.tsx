import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import StoryAvatar from '../components/atoms/StoryAvatar';
import PostCard from '../components/organisms/PostCard';
import type { RootStackParamList } from '../navigation/types';
import { getStoredPosts, getStoredStories, toImageDataUri, updateStoredPostLikes } from '../utils/socialStorage';
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

    const uploadedPosts = storedPosts.map((post) => ({
      id: post.id,
      user: post.user,
      handle: post.handle,
      location: post.location,
      image: toImageDataUri(post.imageBase64),
      caption: post.caption,
      likes: post.likes,
      comments: post.comments,
      isStored: true
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
        ...uploadedStories
      ]);
    } else {
      setOwnStoryId('');
      setOwnStoryUris([]);
      setCurrentStoryIndex(0);
      setHomeStories(uploadedStories);
    }

    setHomePosts(uploadedPosts);
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
    if (!post.isStored) {
      return;
    }

    const alreadyLiked = likedPostIds.includes(post.id);
    const nextLikes = alreadyLiked ? Math.max(0, post.likes - 1) : post.likes + 1;

    await updateStoredPostLikes(post.id, nextLikes);

    setLikedPostIds((current) => {
      if (alreadyLiked) {
        return current.filter((id) => id !== post.id);
      }
      return [...current, post.id];
    });

    setHomePosts((current) =>
      current.map((item) => {
        if (item.id !== post.id) {
          return item;
        }

        return {
          ...item,
          likes: nextLikes
        };
      })
    );

    if (selectedPost?.id === post.id) {
      setSelectedPost((current) => (current ? { ...current, likes: nextLikes } : current));
    }
  };

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
              <Pressable onPress={() => navigation.navigate('Community')}>
                <Text style={[styles.link, { color: theme.colors.primary }]}>Communities</Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            liked={likedPostIds.includes(item.id)}
            onOpenPress={() => handleOpenPost(item)}
            onLikePress={() => handleLikePost(item)}
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
    paddingHorizontal: 20,
    paddingBottom: 12
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
  }
});

export default HomeScreen;
