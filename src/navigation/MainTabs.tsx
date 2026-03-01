import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HomeStack from './HomeStack';
import ExploreStack from './ExploreStack';
import ChatStack from './ChatStack';
import ProfileStack from './ProfileStack';
import { useTheme } from '../theme/ThemeProvider';
import type { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const AddTabButton = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddModal')}>
      <LinearGradient colors={theme.colors.gradients.sunrise} style={styles.addInner}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </LinearGradient>
    </Pressable>
  );
};

const EmptyScreen = () => <View />;

const MainTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.slate400,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60
        }
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={EmptyScreen}
        options={{
          tabBarButton: () => <AddTabButton />
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  addButton: {
    position: 'relative',
    top: -20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default MainTabs;

