import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreScreen from '../screens/ExploreScreen';

const Stack = createNativeStackNavigator();

const ExploreStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Explore" component={ExploreScreen} />
    </Stack.Navigator>
  );
};

export default ExploreStack;
