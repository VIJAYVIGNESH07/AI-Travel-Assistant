import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import {
  getHiddenSpotSubmissions,
  HiddenSpotSubmission,
  updateHiddenSpotSubmissionStatus
} from '../utils/hiddenSpotStorage';

const AdminHiddenSpotReviewScreen = () => {
  const theme = useTheme();
  const [items, setItems] = useState<HiddenSpotSubmission[]>([]);

  const load = useCallback(async () => {
    try {
      const submissions = await getHiddenSpotSubmissions();
      setItems(submissions);
    } catch (error) {
      console.warn('[AdminReview] Failed to load submissions:', error);
      Alert.alert('Load failed', 'Could not fetch submissions from database.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateHiddenSpotSubmissionStatus(id, status);
      Alert.alert('Updated', `Submission marked as ${status}.`);
      load();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Update failed', `Could not update submission: ${message}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No hidden spot submissions yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{item.name}</Text>
            <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>{item.locationLabel}</Text>
            <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Status: {item.status}</Text>
            <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Verify: {item.verify ? 'true' : 'false'}</Text>
            <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Media: {item.imageBase64List.length}</Text>
            <Text style={[styles.description, { color: theme.colors.textPrimary }]}>{item.description}</Text>

            {item.status === 'pending' ? (
              <View style={styles.actions}>
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                  onPress={() => updateStatus(item.id, 'approved')}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.colors.danger }]}
                  onPress={() => updateStatus(item.id, 'rejected')}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 20,
    gap: 12
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14
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
    fontSize: 13
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  emptyState: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600'
  }
});

export default AdminHiddenSpotReviewScreen;
