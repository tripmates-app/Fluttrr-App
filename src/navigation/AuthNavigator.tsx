import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';

// Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import BusinessSignUpScreen from '../screens/auth/BusinessSignUpScreen';
import CreateProfileScreen from '../screens/auth/CreateProfileScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="BusinessSignUp" component={BusinessSignUpScreen} />
      <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
