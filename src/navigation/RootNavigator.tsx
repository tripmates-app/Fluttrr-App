import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/common';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import BusinessTabNavigator from './BusinessTabNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, accountType, user, business } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : accountType === 'business' ? (
          <Stack.Screen name="Business" component={BusinessTabNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
