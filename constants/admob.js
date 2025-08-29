// AdMob Configuration
// Replace these with your actual AdMob IDs from https://admob.google.com

export const ADMOB_CONFIG = {
    // Test IDs for development (replace with your real IDs for production)
    android: {
        appId: 'ca-app-pub-7131261041467249~6343955955', // Test App ID
        banner: 'ca-app-pub-7131261041467249/4181661193', // Test Banner ID
        interstitial: 'ca-app-pub-7131261041467249/3990089509', // Test Interstitial ID
        rewarded: 'ca-app-pub-7131261041467249/1055453336', // Test Rewarded ID
    },
    ios: {
        appId: 'ca-app-pub-7131261041467249~8877817628', // Test App ID
        banner: 'ca-app-pub-7131261041467249/7672547165', // Test Banner ID
        interstitial: 'ca-app-pub-7131261041467249/5154997362', // Test Interstitial ID
        rewarded: 'ca-app-pub-7131261041467249/7269507898', // Test Rewarded ID
    }
};

// Get the appropriate IDs based on platform
export const getAdmobIds = () => {
    const { Platform } = require('react-native');
    return Platform.OS === 'ios' ? ADMOB_CONFIG.ios : ADMOB_CONFIG.android;
};

// Production IDs (replace with your real AdMob IDs)
// export const PRODUCTION_ADMOB_CONFIG = {
//   android: {
//     appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
//     banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
//     interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
//     rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
//   },
//   ios: {
//     appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
//     banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
//     interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
//     rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
//   }
// };
