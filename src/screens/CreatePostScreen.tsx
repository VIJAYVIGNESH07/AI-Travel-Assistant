import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import GradientButton from '../components/atoms/GradientButton';
import { useAppSelector } from '../redux/hooks';
import { addStoredPost } from '../utils/socialStorage';

const CreatePostScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.auth.user);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageBase64, setImageBase64] = useState('');

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to create a post.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
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

  const handlePublish = async () => {
    if (!imageBase64) {
      Alert.alert('Image required', 'Please choose a post image.');
      return;
    }

    await addStoredPost({
      id: `post-${Date.now()}`,
      user: user?.name || 'Traveler',
      handle: user?.handle || '@traveler',
      location: location.trim() || 'Unknown location',
      caption: caption.trim() || 'New post',
      imageBase64,
      likes: 0,
      comments: 0,
      createdAt: Date.now()
    });

    Alert.alert('Post published', 'Your post is now visible on Home.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create Post</Text>
        <Pressable style={[styles.mediaBox, { borderColor: theme.colors.border }]} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <Text style={{ color: theme.colors.textSecondary }}>Select post image</Text>
          )}
        </Pressable>
        <TextInput
          mode="outlined"
          label="Location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Caption"
          value={caption}
          onChangeText={setCaption}
          style={styles.input}
          multiline
          numberOfLines={4}
        />
        <GradientButton title="Publish Post" onPress={handlePublish} />
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
    marginBottom: 16
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16
  },
  input: {
    marginBottom: 12
  }
});

export default CreatePostScreen;
