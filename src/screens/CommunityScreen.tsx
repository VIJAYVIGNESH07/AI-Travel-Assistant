import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import CommunityCard, { CommunityPost } from '../components/organisms/CommunityCard';
import { communities } from '../data/mock';

const STATIC_COMMUNITY_POSTS: Record<string, CommunityPost[]> = {
  c1: [
    {
      id: 'c1-post-1',
      image:
        'https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg?auto=compress&cs=tinysrgb&w=1200',
      caption: 'Morning trek through the misty ridge trail.'
    },
    {
      id: 'c1-post-2',
      image:
        'https://images.pexels.com/photos/672358/pexels-photo-672358.jpeg?auto=compress&cs=tinysrgb&w=1200',
      caption: 'Best summit view from Mountain Hikers community.'
    }
  ],
  c2: [
    {
      id: 'c2-post-1',
      image:
        'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1200',
      caption: 'Golden-hour beach view shared by Beach Lovers.'
    },
    {
      id: 'c2-post-2',
      image:
        'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
      caption: 'Calm coastal walk and sunset vibes.'
    }
  ]
};

const CommunityScreen = () => {
  const theme = useTheme();
  const [expandedCommunityId, setExpandedCommunityId] = useState<string | null>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Communities</Text>
      </View>
      <FlatList
        data={communities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CommunityCard
            community={item}
            posts={STATIC_COMMUNITY_POSTS[item.id] || []}
            showPosts={expandedCommunityId === item.id}
            onViewPress={() => setExpandedCommunityId((current) => (current === item.id ? null : item.id))}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '700'
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40
  }
});

export default CommunityScreen;
