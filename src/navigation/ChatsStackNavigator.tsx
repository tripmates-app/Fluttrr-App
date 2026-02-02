import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatsStackParamList } from '../types';
import { colors } from '../constants/colors';

// Screens
import ChatListScreen from '../screens/chats/ChatListScreen';
import ChatScreen from '../screens/chats/ChatScreen';

const Stack = createNativeStackNavigator<ChatsStackParamList>();

export const ChatsStackNavigator: React.FC = () => {
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
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params.chatTitle,
        })}
      />
    </Stack.Navigator>
  );
};

export default ChatsStackNavigator;
