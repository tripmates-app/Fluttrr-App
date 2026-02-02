import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BusinessTabParamList } from '../types';
import { colors } from '../constants/colors';

// Screens
import BusinessDashboardScreen from '../screens/business/BusinessDashboardScreen';
import CreateEventScreen from '../screens/business/CreateEventScreen';
import BusinessEventsScreen from '../screens/business/BusinessEventsScreen';
import EventAnalyticsScreen from '../screens/business/EventAnalyticsScreen';
import BusinessReviewsScreen from '../screens/business/BusinessReviewsScreen';
import BusinessSettingsScreen from '../screens/business/BusinessSettingsScreen';

const Tab = createBottomTabNavigator<BusinessTabParamList>();
const DashboardStack = createNativeStackNavigator();
const EventsStack = createNativeStackNavigator();

const DashboardStackNavigator = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="Dashboard" component={BusinessDashboardScreen} />
    <DashboardStack.Screen name="EventAnalytics" component={EventAnalyticsScreen} />
  </DashboardStack.Navigator>
);

const EventsStackNavigator = () => (
  <EventsStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerShadowVisible: false,
    }}
  >
    <EventsStack.Screen
      name="BusinessEvents"
      component={BusinessEventsScreen}
      options={{ title: 'My Events' }}
    />
    <EventsStack.Screen
      name="CreateEvent"
      component={CreateEventScreen}
      options={{ title: 'Create Event' }}
    />
    <EventsStack.Screen
      name="EventAnalytics"
      component={EventAnalyticsScreen}
      options={{ title: 'Event Analytics' }}
    />
  </EventsStack.Navigator>
);

export const BusinessTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'DashboardTab':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'CreateEventTab':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'MyEventsTab':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'ReviewsTab':
              iconName = focused ? 'star' : 'star-outline';
              break;
            case 'BusinessSettingsTab':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="CreateEventTab"
        component={CreateEventScreen}
        options={{ tabBarLabel: 'Create' }}
      />
      <Tab.Screen
        name="MyEventsTab"
        component={EventsStackNavigator}
        options={{ tabBarLabel: 'Events' }}
      />
      <Tab.Screen
        name="ReviewsTab"
        component={BusinessReviewsScreen}
        options={{ tabBarLabel: 'Reviews' }}
      />
      <Tab.Screen
        name="BusinessSettingsTab"
        component={BusinessSettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default BusinessTabNavigator;
