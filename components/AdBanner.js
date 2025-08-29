import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Web-compatible AdBanner component
const AdBanner = ({ size = 'banner', style }) => {
    // ADS DISABLED: Uncomment the code below to enable ads
    /*
    // Check if we should show ads
    const shouldShowAds = () => {
        if (Platform.OS === 'web') return false;

        try {
            const Constants = require('expo-constants');
            return Constants.appOwnership !== 'expo'; // Don't show ads in Expo Go
        } catch {
            return false; // If we can't determine, don't show ads
        }
    };

    if (!shouldShowAds()) {
        // Return a placeholder for unsupported environments
        return (
            <View style={[styles.webPlaceholder, style]}>
                <Text style={styles.placeholderText}>Advertisement</Text>
                <Text style={styles.placeholderSubtext}>Ad Space</Text>
            </View>
        );
    }

    // For native platforms with development builds, use the actual AdMob banner
    try {
        const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads');
        const { getAdmobIds } = require('../constants/admob');

        const admobIds = getAdmobIds();
        const adUnitId = __DEV__ ? BannerAd.testId : admobIds.banner;

        const bannerSizes = {
            banner: BannerAdSize.BANNER,
            largeBanner: BannerAdSize.LARGE_BANNER,
            mediumRectangle: BannerAdSize.MEDIUM_RECTANGLE,
            fullBanner: BannerAdSize.FULL_BANNER,
            leaderboard: BannerAdSize.LEADERBOARD,
            adaptive: BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
        };

        return (
            <BannerAd
                unitId={adUnitId}
                size={bannerSizes[size] || BannerAdSize.BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                }}
                style={style}
            />
        );
    } catch (error) {
        console.warn('AdMob BannerAd not available:', error);
        return (
            <View style={[styles.errorPlaceholder, style]}>
                <Text style={styles.errorText}>Ad Unavailable</Text>
            </View>
        );
    }
    */

    // ADS DISABLED: Always show placeholder
    return (
        <View style={[styles.webPlaceholder, style]}>
            <Text style={styles.placeholderText}>Ads Disabled</Text>
            <Text style={styles.placeholderSubtext}>Ad Space</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    webPlaceholder: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    placeholderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    placeholderSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    errorPlaceholder: {
        backgroundColor: '#ffebee',
        borderWidth: 1,
        borderColor: '#f44336',
        borderRadius: 4,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    errorText: {
        fontSize: 12,
        color: '#f44336',
    },
});

export default AdBanner;
