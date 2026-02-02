import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import { RootNavigator } from './src/navigation';
import { colors } from './src/constants/colors';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <RootNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}
