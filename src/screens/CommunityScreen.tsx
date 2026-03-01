import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import SegmentedControl from '../components/molecules/SegmentedControl';
import CommunityCard from '../components/organisms/CommunityCard';
import { communities } from '../data/mock';

const CommunityScreen = () => {
  const theme = useTheme();
  const [tab, setTab] = useState('Suggested');

  const filtered = communities.filter((community) => {
    if (tab === 'Joined') return community.joined;
    if (tab === 'Suggested') return !community.joined;
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Communities</Text>
      </View>
      <View style={styles.tabs}>
        <SegmentedControl options={['Joined', 'Suggested', 'All']} value={tab} onChange={setTab} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <CommunityCard community={item} />}
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
  tabs: {
    paddingHorizontal: 20
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40
  }
});

export default CommunityScreen;
