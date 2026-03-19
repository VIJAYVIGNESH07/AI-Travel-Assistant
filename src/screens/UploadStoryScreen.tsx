import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import GradientButton from '../components/atoms/GradientButton';
import { useAppSelector } from '../redux/hooks';
import { addStoredStory } from '../utils/socialStorage';

const UploadStoryScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.auth.user);
  const [imageUri, setImageUri] = useState('');
  const [imageBase64, setImageBase64] = useState('');

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to upload a story.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.7,
      base64: true
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Upload failed', 'Unable to read image data.');
      return;
    }

    setImageUri(asset.uri);
    setImageBase64(asset.base64);
  };

  const handleUpload = async () => {
    if (!imageBase64) {
      Alert.alert('Image required', 'Please choose a story image.');
      return;
    }

    await addStoredStory({
      id: `story-${Date.now()}`,
      name: user?.name || 'Your Story',
      imageBase64,
      seen: false,
      isAdd: false,
      createdAt: Date.now()
    });

    Alert.alert('Story uploaded', 'Your story is now visible on Home.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Upload Story</Text>
        <View style={[styles.mediaBox, { borderColor: theme.colors.border }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <Text style={{ color: theme.colors.textSecondary }}>No story image selected</Text>
          )}
        </View>
        <Pressable
          style={[styles.addImageButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
          onPress={pickImage}
        >
          <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.addImageText, { color: theme.colors.primary }]}>Add Story Image</Text>
        </Pressable>
        <GradientButton title="Upload Story" onPress={handleUpload} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  mediaBox: {
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    marginBottom: 16
  },
  addImageText: {
    fontSize: 13,
    fontWeight: '700'
  }
});

export default UploadStoryScreen;
