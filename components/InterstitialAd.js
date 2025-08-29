import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

class InterstitialAdManager {
    constructor() {
        this.interstitial = null;
        this.loaded = false;
    }

    initialize() {
        // ADS DISABLED: Uncomment the code below to enable ads
        /*
        if (Platform.OS === 'web') {
            console.log('InterstitialAdManager: Web platform detected, skipping ad initialization');
            return;
        }

        // Check if running in Expo Go
        try {
            const Constants = require('expo-constants');
            if (Constants.appOwnership === 'expo') {
                console.log('InterstitialAdManager: Expo Go detected, skipping ad initialization');
                return;
            }
        } catch (error) {
            console.warn('Could not check Expo environment:', error);
            return;
        }

        try {
            const { InterstitialAd, TestIds } = require('react-native-google-mobile-ads');
            const { getAdmobIds } = require('../constants/admob');
            const admobIds = getAdmobIds();
            const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : admobIds.interstitial;

            console.log('InterstitialAdManager: Initializing with Ad Unit ID:', adUnitId);

            this.interstitial = InterstitialAd.createForAdRequest(adUnitId, {
                requestNonPersonalizedAdsOnly: false,
            });

            this.interstitial.addAdEventListener('adLoaded', () => {
                console.log('InterstitialAdManager: Ad loaded successfully');
                this.loaded = true;
            });

            this.interstitial.addAdEventListener('adFailedToLoad', (error) => {
                console.error('InterstitialAdManager: Ad failed to load:', error);
                this.loaded = false;
            });

            this.interstitial.addAdEventListener('adOpened', () => {
                console.log('InterstitialAdManager: Ad opened');
            });

            this.interstitial.addAdEventListener('adClosed', () => {
                console.log('InterstitialAdManager: Ad closed');
                this.loaded = false;
                // Load next ad
                this.loadAd();
            });

            this.interstitial.addAdEventListener('adLeftApplication', () => {
                console.log('InterstitialAdManager: User left application');
            });

            // Load initial ad
            this.loadAd();
        } catch (error) {
            console.warn('InterstitialAdManager: AdMob not available:', error);
        }
        */

        console.log('InterstitialAdManager: Ads disabled');
    }

    loadAd() {
        if (this.interstitial && !this.loaded) {
            console.log('InterstitialAdManager: Loading ad...');
            this.interstitial.load();
        }
    }

    showAd() {
        // ADS DISABLED: Uncomment the code below to enable ads
        /*
        if (Platform.OS === 'web') {
            console.log('InterstitialAdManager: Web platform detected, skipping ad display');
            return Promise.resolve();
        }

        // Check if running in Expo Go
        try {
            const Constants = require('expo-constants');
            if (Constants.appOwnership === 'expo') {
                console.log('InterstitialAdManager: Expo Go detected, skipping ad display');
                return Promise.resolve();
            }
        } catch (error) {
            console.warn('Could not check Expo environment:', error);
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            if (this.interstitial && this.loaded) {
                console.log('InterstitialAdManager: Showing ad...');
                this.interstitial.show();
                resolve(true);
            } else {
                console.log('InterstitialAdManager: Ad not ready, skipping');
                resolve(false);
            }
        });
        */

        console.log('InterstitialAdManager: Ads disabled, skipping ad display');
        return Promise.resolve(false);
    }

    isLoaded() {
        return this.loaded;
    }
}

// Create singleton instance
const interstitialManager = new InterstitialAdManager();

// React hook for using interstitial ads
export const useInterstitialAd = () => {
    const managerRef = useRef(interstitialManager);

    useEffect(() => {
        if (!managerRef.current.interstitial) {
            managerRef.current.initialize();
        }
    }, []);

    return {
        showAd: () => managerRef.current.showAd(),
        isLoaded: () => managerRef.current.isLoaded(),
    };
};

export default interstitialManager;
