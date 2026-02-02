import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../types';
import { colors } from '../constants/colors';

// Screens
import EventsListScreen from '../screens/events/EventsListScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import EventFiltersScreen from '../screens/events/EventFiltersScreen';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export const EventsStackNavigator: React.FC = () => {
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
        name="EventsList"
        component={EventsListScreen}
        options={{ title: 'Events' }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Filters"
        component={EventFiltersScreen}
        options={{
          title: 'Filters',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default EventsStackNavigator;
