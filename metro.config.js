// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude react-native-google-mobile-ads from web builds
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web' && moduleName === 'react-native-google-mobile-ads') {
        return {
            type: 'empty',
        };
    }

    // Handle other modules normally
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
