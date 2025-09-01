# Google Mobile Ads Integration Guide

This guide explains how to set up and use Google Mobile Ads (AdMob) in your React Native Expo app.

## 📋 Prerequisites

1. **Google AdMob Account**: Create an account at [admob.google.com](https://admob.google.com)
2. **Expo Development Build**: Required for native modules like Google Mobile Ads

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npx expo install react-native-google-mobile-ads
```

### 2. Configure App IDs

**File: `app.json`**
```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
        "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
      }
    ]
  ]
}
```

### 3. Get Your AdMob IDs

#### Finding Your App IDs:
1. Go to [AdMob Console](https://admob.google.com)
2. Select your app from the sidebar
3. Copy the **App ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

#### Creating Ad Units:
1. In AdMob Console, go to **Ad units** in the sidebar
2. Click **Add ad unit**
3. Choose ad format (Banner, Interstitial, Rewarded)
4. Copy the **Ad unit ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

### 4. Update AdMob Configuration

**File: `constants/admob.js`**
```javascript
export const ADMOB_CONFIG = {
  android: {
    appId: 'ca-app-pub-YOUR_ANDROID_APP_ID~XXXXXXXXXX',
    banner: 'ca-app-pub-YOUR_ANDROID_APP_ID/XXXXXXXXXX',
    interstitial: 'ca-app-pub-YOUR_ANDROID_APP_ID/XXXXXXXXXX',
    rewarded: 'ca-app-pub-YOUR_ANDROID_APP_ID/XXXXXXXXXX',
  },
  ios: {
    appId: 'ca-app-pub-YOUR_IOS_APP_ID~XXXXXXXXXX',
    banner: 'ca-app-pub-YOUR_IOS_APP_ID/XXXXXXXXXX',
    interstitial: 'ca-app-pub-YOUR_IOS_APP_ID/XXXXXXXXXX',
    rewarded: 'ca-app-pub-YOUR_IOS_APP_ID/XXXXXXXXXX',
  }
};
```

## 📱 Usage Examples

### Banner Ads
```javascript
import AdBanner from '../components/AdBanner';

function MyScreen() {
  return (
    <View>
      {/* Content */}
      <AdBanner
        size="BANNER"
        style={{ marginVertical: 10 }}
      />
      {/* More content */}
    </View>
  );
}
```

### Interstitial Ads
```javascript
import { useInterstitialAd } from '../components/InterstitialAd';

function MyScreen() {
  const { showAd, isLoaded } = useInterstitialAd();

  const handleAction = async () => {
    await showAd(); // Show ad before action
    performAction();
  };

  return (
    <Button
      title="Perform Action"
      onPress={handleAction}
      disabled={!isLoaded}
    />
  );
}
```

### Rewarded Ads
```javascript
import { useRewardedAd } from '../components/RewardedAd';

function PremiumFeature() {
  const { showAd, isLoaded } = useRewardedAd();

  const unlockFeature = async () => {
    const result = await showAd();
    if (result.showed) {
      // User watched the ad and earned reward
      enablePremiumFeature();
    }
  };

  return (
    <Button
      title="Watch Ad for Premium"
      onPress={unlockFeature}
      disabled={!isLoaded}
    />
  );
}
```

## 🏗️ Development vs Production

The app automatically uses **test ad units** in development mode (`__DEV__ === true`) and switches to your **production ad units** when built for production.

### Test Ad Units (Used in Development)
- **Banner**: `ca-app-pub-3940256099942544/6300978111`
- **Interstitial**: `ca-app-pub-3940256099942544/1033173712`
- **Rewarded**: `ca-app-pub-3940256099942544/5224354917`

## 📋 AdMob Console Setup

### 1. Create an App
1. Go to [AdMob Console](https://admob.google.com)
2. Click **"Add app"**
3. Choose platform (iOS/Android)
4. Enter your app details

### 2. Create Ad Units
1. Select your app
2. Go to **"Ad units"** → **"Add ad unit"**
3. Choose format:
   - **Banner**: For rectangular ads
   - **Interstitial**: For full-screen ads
   - **Rewarded**: For video ads with rewards

### 3. Copy IDs
- **App ID**: Found in app settings
- **Ad Unit IDs**: Found in each ad unit's details

## 🚨 Important Notes

### Privacy & Compliance
- **User Consent**: Implement consent forms for GDPR/CCPA
- **Children's Privacy**: If your app targets children under 13, disable personalized ads
- **Test Mode**: Always test with test ad units first

### Best Practices
- **Ad Placement**: Don't block important UI elements
- **Loading States**: Handle ad loading states gracefully
- **Error Handling**: Implement proper error handling for failed ad loads
- **User Experience**: Don't show ads too frequently

### Platform Differences
- **iOS**: Requires App Store app for live ads
- **Android**: Can test on device immediately
- **Web**: Ads are not supported (components return placeholders)

## 🔍 Troubleshooting

### Common Issues

**"Ad failed to load"**
- Check internet connection
- Verify AdMob account is approved
- Ensure ad units are active
- Check console for detailed error messages

**"Module not found"**
- Ensure you're using a development build
- Rebuild the development client
- Clear Metro cache: `npx expo start --clear`

**"Invalid ad unit ID"**
- Double-check the ad unit ID format
- Ensure you're using the correct ID for the platform
- Test with test IDs first

## 📊 Ad Performance Monitoring

Monitor your ad performance in the AdMob console:
- **Impressions**: How many times ads are shown
- **Clicks**: User interactions with ads
- **Revenue**: Earnings from ads
- **eCPM**: Effective cost per thousand impressions

## 📞 Support

- [AdMob Help Center](https://support.google.com/admob)
- [React Native Google Mobile Ads Docs](https://docs.page/invertase/react-native-google-mobile-ads)
- [Expo Documentation](https://docs.expo.dev/)

---

**Remember**: Always test thoroughly with test ad units before publishing with production ad units!
