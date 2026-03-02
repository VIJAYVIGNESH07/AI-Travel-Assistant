import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthScreen from '../screens/AuthScreen';
import MainTabs from './MainTabs';
import AddModal from '../screens/AddModal';
import CommunityScreen from '../screens/CommunityScreen';
import HiddenSpotScreen from '../screens/HiddenSpotScreen';
import LocalGuidesScreen from '../screens/LocalGuidesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TripPlannerScreen from '../screens/TripPlannerScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import UploadStoryScreen from '../screens/UploadStoryScreen';
import PlaceDetailsScreen from '../screens/PlaceDetailsScreen';
import AdminHiddenSpotReviewScreen from '../screens/AdminHiddenSpotReviewScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AddModal"
        component={AddModal}
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ headerShown: true, title: 'Communities' }} />
      <Stack.Screen name="HiddenSpot" component={HiddenSpotScreen} options={{ headerShown: true, title: 'Add Hidden Spot' }} />
      <Stack.Screen name="LocalGuides" component={LocalGuidesScreen} options={{ headerShown: true, title: 'Local Guides' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="TripPlanner" component={TripPlannerScreen} options={{ headerShown: true, title: 'Plan Trip' }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ headerShown: true, title: 'Create Post' }} />
      <Stack.Screen name="UploadStory" component={UploadStoryScreen} options={{ headerShown: true, title: 'Upload Story' }} />
      <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} options={{ headerShown: true, title: 'Place Details' }} />
      <Stack.Screen
        name="AdminHiddenSpotReview"
        component={AdminHiddenSpotReviewScreen}
        options={{ headerShown: true, title: 'Hidden Spot Reviews' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
