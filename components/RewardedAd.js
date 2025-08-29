import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

class RewardedAdManager {
    constructor() {
        this.rewarded = null;
        this.loaded = false;
    }

    initialize() {
        // ADS DISABLED: Uncomment the code below to enable ads
        /*
        if (Platform.OS === 'web') {
            console.log('RewardedAdManager: Web platform detected, skipping ad initialization');
            return;
        }

        // Check if running in Expo Go
        try {
            const Constants = require('expo-constants');
            if (Constants.appOwnership === 'expo') {
                console.log('RewardedAdManager: Expo Go detected, skipping ad initialization');
                return;
            }
        } catch (error) {
            console.warn('Could not check Expo environment:', error);
            return;
        }

        try {
            const { RewardedAd, TestIds } = require('react-native-google-mobile-ads');
            const { getAdmobIds } = require('../constants/admob');
            const admobIds = getAdmobIds();
            const adUnitId = __DEV__ ? TestIds.REWARDED : admobIds.rewarded;

            console.log('RewardedAdManager: Initializing with Ad Unit ID:', adUnitId);

            this.rewarded = RewardedAd.createForAdRequest(adUnitId, {
                requestNonPersonalizedAdsOnly: false,
            });

            this.rewarded.addAdEventListener('adLoaded', () => {
                console.log('RewardedAdManager: Ad loaded successfully');
                this.loaded = true;
            });

            this.rewarded.addAdEventListener('adFailedToLoad', (error) => {
                console.error('RewardedAdManager: Ad failed to load:', error);
                this.loaded = false;
            });

            this.rewarded.addAdEventListener('adOpened', () => {
                console.log('RewardedAdManager: Ad opened');
            });

            this.rewarded.addAdEventListener('adClosed', () => {
                console.log('RewardedAdManager: Ad closed');
                this.loaded = false;
                // Load next ad
                this.loadAd();
            });

            this.rewarded.addAdEventListener('adRewarded', (reward) => {
                console.log('RewardedAdManager: User earned reward:', reward);
                // Handle reward logic here
            });

            this.rewarded.addAdEventListener('adLeftApplication', () => {
                console.log('RewardedAdManager: User left application');
            });

            // Load initial ad
            this.loadAd();
        } catch (error) {
            console.warn('RewardedAdManager: AdMob not available:', error);
        }
        */

        console.log('RewardedAdManager: Ads disabled');
    }

    loadAd() {
        if (this.rewarded && !this.loaded) {
            console.log('RewardedAdManager: Loading ad...');
            this.rewarded.load();
        }
    }

    showAd() {
        // ADS DISABLED: Uncomment the code below to enable ads
        /*
        if (Platform.OS === 'web') {
            console.log('RewardedAdManager: Web platform detected, skipping ad display');
            return Promise.resolve();
        }

        // Check if running in Expo Go
        try {
            const Constants = require('expo-constants');
            if (Constants.appOwnership === 'expo') {
                console.log('RewardedAdManager: Expo Go detected, skipping ad display');
                return Promise.resolve();
            }
        } catch (error) {
            console.warn('Could not check Expo environment:', error);
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            if (this.rewarded && this.loaded) {
                console.log('RewardedAdManager: Showing ad...');
                this.rewarded.show();
                resolve(true);
            } else {
                console.log('RewardedAdManager: Ad not ready, skipping');
                resolve(false);
            }
        });
        */

        console.log('RewardedAdManager: Ads disabled, skipping ad display');
        return Promise.resolve(false);
    }

    isLoaded() {
        return this.loaded;
    }
}

// Create singleton instance
const rewardedManager = new RewardedAdManager();

// React hook for using rewarded ads
export const useRewardedAd = () => {
    const managerRef = useRef(rewardedManager);

    useEffect(() => {
        if (!managerRef.current.rewarded) {
            managerRef.current.initialize();
        }
    }, []);

    return {
        showAd: () => managerRef.current.showAd(),
        isLoaded: () => managerRef.current.isLoaded(),
    };
};

export default rewardedManager;
