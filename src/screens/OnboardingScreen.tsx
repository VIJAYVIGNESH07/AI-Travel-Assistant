import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import { onboardingSlides } from '../data/mock';
import GradientButton from '../components/atoms/GradientButton';
import { useAppDispatch } from '../redux/hooks';
import { completeOnboarding } from '../redux/slices/onboardingSlice';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const finish = async () => {
    dispatch(completeOnboarding());
    await AsyncStorage.setItem('onboarding_complete', '1');
    navigation.replace('Auth');
  };

  const handleNext = () => {
    if (index < onboardingSlides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Pressable style={styles.skip} onPress={finish}>
        <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={onboardingSlides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.6)']} style={styles.overlay}
            />
            <View style={styles.textArea}>
              <Text style={[styles.title, { color: theme.colors.white }]}>{item.title}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.slate100 }]}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {onboardingSlides.map((_, dotIndex) => (
            <View
              key={`dot-${dotIndex}`}
              style={[
                styles.dot,
                { backgroundColor: dotIndex === index ? theme.colors.primary : theme.colors.slate400 }
              ]}
            />
          ))}
        </View>
        <GradientButton title={index === onboardingSlides.length - 1 ? 'Get Started' : 'Next'} onPress={handleNext} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  skip: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 2
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600'
  },
  slide: {
    width,
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  textArea: {
    position: 'absolute',
    bottom: 140,
    left: 24,
    right: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4
  }
});

export default OnboardingScreen;
