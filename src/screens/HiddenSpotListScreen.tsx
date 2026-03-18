import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { getApprovedHiddenSpotPublicItems, HiddenSpotPublicItem } from '../utils/hiddenSpotStorage';

const HiddenSpotListScreen = () => {
  const theme = useTheme();
  const [items, setItems] = useState<HiddenSpotPublicItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const approved = await getApprovedHiddenSpotPublicItems();
      setItems(approved);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Hidden Spots</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Approved spots fetched from submissions.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyWrap, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {loading ? 'Loading approved hidden spots...' : 'No approved hidden spots yet.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" /> : null}
            <View style={styles.body}>
              <View style={styles.row}>
                <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Location: {item.locationLabel}</Text>
              <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Applied by: {item.appliedBy} ({item.appliedByHandle})</Text>
              <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Category: {item.category}</Text>
              <Text style={[styles.description, { color: theme.colors.textPrimary }]}>{item.description}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28
  },
  header: {
    paddingTop: 8,
    paddingBottom: 14
  },
  title: {
    fontSize: 22,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13
  },
  emptyWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600'
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14
  },
  image: {
    width: '100%',
    height: 140
  },
  body: {
    padding: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  meta: {
    marginTop: 6,
    fontSize: 12
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18
  }
});

export default HiddenSpotListScreen;
