import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default ChatStack;
