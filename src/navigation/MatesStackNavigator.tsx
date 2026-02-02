import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MatesStackParamList } from '../types';
import { colors } from '../constants/colors';

// Screens
import DiscoveryScreen from '../screens/mates/DiscoveryScreen';
import MatesFiltersScreen from '../screens/mates/MatesFiltersScreen';
import UserProfileScreen from '../screens/mates/UserProfileScreen';
import MateRequestsScreen from '../screens/mates/MateRequestsScreen';

const Stack = createNativeStackNavigator<MatesStackParamList>();

export const MatesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 600,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Discovery"
        component={DiscoveryScreen}
        options={{ title: 'Discover Mates' }}
      />
      <Stack.Screen
        name="MatesFilters"
        component={MatesFiltersScreen}
        options={{
          title: 'Filters',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MateRequests"
        component={MateRequestsScreen}
        options={{ title: 'Mate Requests' }}
      />
    </Stack.Navigator>
  );
};

export default MatesStackNavigator;
