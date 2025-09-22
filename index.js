import { registerRootComponent } from 'expo';
import App from './app/App.js';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
// import TestScreen from './app/Test.js';
// import SearchScreen from './app/Search.js';

const Root = () => (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <App />
    </GestureHandlerRootView>
);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App, () => Root())
// registerRootComponent(TestScreen);
// registerRootComponent(SearchScreen)