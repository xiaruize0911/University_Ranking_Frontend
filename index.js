import { registerRootComponent } from 'expo';

import App from './app/App.js';
// import TestScreen from './app/Test.js';
// import SearchScreen from './app/Search.js';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
// registerRootComponent(TestScreen);
// registerRootComponent(SearchScreen)