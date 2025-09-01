// Unified preference storage system for web service
// All preferences are stored in localStorage for web platform

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Default user profile structure
const DEFAULT_PROFILE = {
    favoriteCount: 0,
    themePreference: 'light',
    languagePreference: 'en',
    lastUpdated: new Date().toISOString()
};

// Storage keys
const STORAGE_KEYS = {
    USER_PROFILE: 'userProfile',
    LANGUAGE_PREFERENCE: 'languagePreference' // Legacy key, will be migrated
};

/**
 * Get user profile from storage
 * @returns {Promise<Object>} User profile object
 */
export const getUserProfile = async () => {
    try {
        if (Platform.OS === 'web') {
            // Use localStorage for web
            const profileData = window.localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            if (profileData) {
                const profile = JSON.parse(profileData);
                // Migrate legacy language preference if exists
                const legacyLang = window.localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
                if (legacyLang && !profile.languagePreference) {
                    profile.languagePreference = legacyLang;
                    // Clean up legacy key
                    window.localStorage.removeItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
                    // Save updated profile
                    window.localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
                }
                return { ...DEFAULT_PROFILE, ...profile };
            }
            return DEFAULT_PROFILE;
        } else {
            // Use FileSystem for mobile
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            const profileExists = await FileSystem.getInfoAsync(profileFile);

            if (profileExists.exists) {
                const profileContent = await FileSystem.readAsStringAsync(profileFile);
                const profile = JSON.parse(profileContent);
                return { ...DEFAULT_PROFILE, ...profile };
            }
            return DEFAULT_PROFILE;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        return DEFAULT_PROFILE;
    }
};

/**
 * Save user profile to storage
 * @param {Object} profile - Profile data to save
 * @returns {Promise<boolean>} Success status
 */
export const saveUserProfile = async (profile) => {
    try {
        const updatedProfile = {
            ...DEFAULT_PROFILE,
            ...profile,
            lastUpdated: new Date().toISOString()
        };

        if (Platform.OS === 'web') {
            // Use localStorage for web
            window.localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
            return true;
        } else {
            // Use FileSystem for mobile
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            await FileSystem.writeAsStringAsync(profileFile, JSON.stringify(updatedProfile, null, 2));
            return true;
        }
    } catch (error) {
        console.error('Error saving user profile:', error);
        return false;
    }
};

/**
 * Update specific preference in user profile
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 * @returns {Promise<boolean>} Success status
 */
export const updatePreference = async (key, value) => {
    try {
        const currentProfile = await getUserProfile();
        const updatedProfile = {
            ...currentProfile,
            [key]: value
        };
        return await saveUserProfile(updatedProfile);
    } catch (error) {
        console.error('Error updating preference:', error);
        return false;
    }
};

/**
 * Get specific preference from user profile
 * @param {string} key - Preference key
 * @param {any} defaultValue - Default value if preference not found
 * @returns {Promise<any>} Preference value
 */
export const getPreference = async (key, defaultValue = null) => {
    try {
        const profile = await getUserProfile();
        return profile[key] !== undefined ? profile[key] : defaultValue;
    } catch (error) {
        console.error('Error getting preference:', error);
        return defaultValue;
    }
};

/**
 * Clear all user preferences
 * @returns {Promise<boolean>} Success status
 */
export const clearAllPreferences = async () => {
    try {
        if (Platform.OS === 'web') {
            // Clear localStorage for web
            window.localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
            window.localStorage.removeItem(STORAGE_KEYS.LANGUAGE_PREFERENCE); // Clean up legacy
            return true;
        } else {
            // Clear FileSystem for mobile
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            const profileExists = await FileSystem.getInfoAsync(profileFile);
            if (profileExists.exists) {
                await FileSystem.deleteAsync(profileFile);
            }
            return true;
        }
    } catch (error) {
        console.error('Error clearing preferences:', error);
        return false;
    }
};

// Legacy functions for backward compatibility
export const getFavoriteCount = async () => getPreference('favoriteCount', 0);
export const updateFavoriteCount = async (count) => updatePreference('favoriteCount', count);

export const getLanguagePreference = async () => getPreference('languagePreference', 'en');
export const saveLanguagePreference = async (language) => updatePreference('languagePreference', language);

export const getThemePreference = async () => getPreference('themePreference', 'light');
export const saveThemePreference = async (theme) => updatePreference('themePreference', theme);
