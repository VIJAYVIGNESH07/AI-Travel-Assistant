import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  name: string;
  image: string;
  seen?: boolean;
  isAdd?: boolean;
  onPress?: () => void;
};

const StoryAvatar = ({ name, image, seen = false, isAdd = false, onPress }: Props) => {
  const theme = useTheme();
  const ringColors = seen ? [theme.colors.border, theme.colors.border] : theme.colors.gradients.sunrise;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <LinearGradient colors={ringColors} style={styles.ring}>
        <Image source={{ uri: image }} style={styles.avatar} />
        {isAdd && (
          <View style={[styles.addBadge, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.addText}>+</Text>
          </View>
        )}
      </LinearGradient>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 70
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  label: {
    marginTop: 6,
    fontSize: 12
  },
  addBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  addText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  }
});

export default StoryAvatar;
