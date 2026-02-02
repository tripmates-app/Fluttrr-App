import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';
import { colors } from '../constants/colors';

// Screens
import FeedScreen from '../screens/home/FeedScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import BusinessProfileScreen from '../screens/business/BusinessProfileScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinessProfile"
        component={BusinessProfileScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
