import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable, Modal } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { posts } from '../data/mock';
import SegmentedControl from '../components/molecules/SegmentedControl';
import { useAppSelector } from '../redux/hooks';
import type { RootStackParamList } from '../navigation/types';
import { getStoredPosts, getStoredStories, toImageDataUri } from '../utils/socialStorage';

type ProfilePost = {
  id: string;
  user: string;
  handle: string;
  location: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
};

const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAppSelector((state) => state.auth.user);
  const [tab, setTab] = useState('Posts');
  const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedPostImage, setSelectedPostImage] = useState('');
  const [profileStoryUris, setProfileStoryUris] = useState<string[]>([]);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  const profile = user || {
    name: 'Sarah Thompson',
    handle: '@sarahwanders',
    location: 'New York, USA',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  };

  const loadProfilePosts = useCallback(async () => {
    const storedStories = await getStoredStories();
    const storedPosts = await getStoredPosts();
    const currentUserName = user?.name || 'Your Story';
    const ownStories = storedStories.filter((story) => story.name === currentUserName);
    const ownStoredPosts = storedPosts
      .filter((item) => (user?.handle ? item.handle === user.handle : true))
      .map((item) => ({
        id: item.id,
        user: item.user,
        handle: item.handle,
        location: item.location,
        image: toImageDataUri(item.imageBase64),
        caption: item.caption,
        likes: item.likes,
        comments: item.comments
      }));

    setProfileStoryUris(ownStories.map((story) => toImageDataUri(story.imageBase64)));
    setProfilePosts(ownStoredPosts);
  }, [user?.handle, user?.name]);

  useFocusEffect(
    useCallback(() => {
      loadProfilePosts();
    }, [loadProfilePosts])
  );

  useEffect(() => {
    if (!storyViewerVisible || profileStoryUris.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setStoryIndex((current) => {
        if (current >= profileStoryUris.length - 1) {
          setStoryViewerVisible(false);
          return 0;
        }

        return current + 1;
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [storyViewerVisible, profileStoryUris.length, storyIndex]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          <Image source={{ uri: posts[0].image }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
          <Ionicons
            name="settings-outline"
            size={20}
            color="#FFFFFF"
            style={styles.settingsIcon}
            onPress={() => navigation.navigate('Settings')}
          />
          <View style={styles.avatarWrap}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{profile.name}</Text>
          <Text style={[styles.handle, { color: theme.colors.textSecondary }]}>{profile.handle}</Text>
          <Text style={[styles.location, { color: theme.colors.textSecondary }]}>{profile.location}</Text>
        </View>

        <View style={styles.tabs}>
          <SegmentedControl options={['Posts', 'Spots']} value={tab} onChange={setTab} />
        </View>

        {profileStoryUris.length > 0 ? (
          <Pressable
            style={styles.storyLineup}
            onPress={() => {
              setStoryIndex(0);
              setStoryViewerVisible(true);
            }}
          >
            {profileStoryUris.map((_, index) => (
              <View
                key={`profile-story-${index}`}
                style={[styles.storyLineSegment, { backgroundColor: theme.colors.border }]}
              />
            ))}
          </Pressable>
        ) : null}

        <FlatList
          data={profilePosts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              style={styles.gridImageWrap}
              onPress={() => {
                setSelectedPostImage(item.image);
                setPostViewerVisible(true);
              }}
            >
              <Image source={{ uri: item.image }} style={styles.gridImage} />
            </Pressable>
          )}
        />
      </ScrollView>

      <Modal visible={postViewerVisible} transparent={false} animationType="fade">
        <View style={styles.postViewer}>
          {selectedPostImage ? <Image source={{ uri: selectedPostImage }} style={styles.postViewerImage} contentFit="contain" /> : null}
          <Pressable style={styles.backButton} onPress={() => setPostViewerVisible(false)}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>

      <Modal visible={storyViewerVisible} transparent={false} animationType="fade">
        <View style={styles.storyViewer}>
          {profileStoryUris[storyIndex] ? (
            <Image source={{ uri: profileStoryUris[storyIndex] }} style={styles.storyViewerImage} contentFit="cover" />
          ) : null}
          <View style={styles.storyProgressWrap}>
            {profileStoryUris.map((_, index) => (
              <View key={`story-progress-${index}`} style={styles.storyProgressTrack}>
                <View
                  style={[
                    styles.storyProgressFill,
                    { backgroundColor: index <= storyIndex ? '#FFFFFF' : 'rgba(255,255,255,0.35)' }
                  ]}
                />
              </View>
            ))}
          </View>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              setStoryViewerVisible(false);
              setStoryIndex(0);
            }}
          >
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
  cover: {
    height: 220,
    position: 'relative'
  },
  coverImage: {
    width: '100%',
    height: '100%'
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  settingsIcon: {
    position: 'absolute',
    top: 16,
    right: 20
  },
  avatarWrap: {
    position: 'absolute',
    left: 20,
    bottom: -40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 60
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  profileInfo: {
    marginTop: 48,
    paddingHorizontal: 20
  },
  name: {
    fontSize: 20,
    fontWeight: '700'
  },
  handle: {
    marginTop: 4,
    fontSize: 12
  },
  location: {
    marginTop: 4,
    fontSize: 12
  },
  bio: {
    marginTop: 12,
    paddingHorizontal: 20,
    fontSize: 13
  },
  tabs: {
    paddingHorizontal: 20,
    marginTop: 20
  },
  storyLineup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    marginTop: 14
  },
  storyLineSegment: {
    flex: 1,
    height: 3,
    borderRadius: 999
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 12
  },
  gridImageWrap: {
    width: '31%'
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8
  },
  postViewer: {
    flex: 1,
    backgroundColor: '#000000'
  },
  postViewerImage: {
    width: '100%',
    height: '100%'
  },
  storyViewer: {
    flex: 1,
    backgroundColor: '#000000'
  },
  storyViewerImage: {
    width: '100%',
    height: '100%'
  },
  storyProgressWrap: {
    position: 'absolute',
    top: 20,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6
  },
  storyProgressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden'
  },
  storyProgressFill: {
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

export default ProfileScreen;
