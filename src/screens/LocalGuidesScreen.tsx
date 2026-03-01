import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import SearchBar from '../components/molecules/SearchBar';
import SegmentedControl from '../components/molecules/SegmentedControl';
import GuideCard from '../components/organisms/GuideCard';
import { guides } from '../data/mock';

const LocalGuidesScreen = () => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('All');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Local Guides</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Bangalore</Text>
      </View>

      <View style={styles.searchRow}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search guides" />
      </View>

      <View style={styles.tabs}>
        <SegmentedControl options={['All', 'Top Rated', 'Nearby']} value={tab} onChange={setTab} />
      </View>

      <FlatList
        data={guides}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <GuideCard guide={item} />}
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
  subtitle: {
    marginTop: 4,
    fontSize: 12
  },
  searchRow: {
    paddingHorizontal: 20
  },
  tabs: {
    paddingHorizontal: 20,
    marginTop: 12
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40
  }
});

export default LocalGuidesScreen;
