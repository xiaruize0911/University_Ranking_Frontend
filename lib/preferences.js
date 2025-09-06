// Unified preference storage system for web service
// Web platform uses Cache API for profile storage, mobile uses FileSystem
// All preferences are stored in browser cache for web platform

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

// Cache configuration for web platform
const CACHE_NAME = 'university-ranking-profile-cache';
const PROFILE_CACHE_KEY = 'user-profile-data';

/**
 * Get user profile from storage
 * @returns {Promise<Object>} User profile object
 */
export const getUserProfile = async () => {
    try {
        if (Platform.OS === 'web') {
            // Use Cache API for web platform
            if ('caches' in window) {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match(PROFILE_CACHE_KEY);

                    if (cachedResponse) {
                        const profile = await cachedResponse.json();
                        // Migrate legacy language preference if exists
                        const legacyLang = window.localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
                        if (legacyLang && !profile.languagePreference) {
                            profile.languagePreference = legacyLang;
                            // Clean up legacy key
                            window.localStorage.removeItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
                            // Save updated profile
                            await saveUserProfile(profile);
                        }
                        return { ...DEFAULT_PROFILE, ...profile };
                    }
                } catch (cacheError) {
                    console.warn('Cache API not available, falling back to localStorage:', cacheError);
                    // Fallback to localStorage if Cache API fails
                    const profileData = window.localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
                    if (profileData) {
                        const profile = JSON.parse(profileData);
                        const legacyLang = window.localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
                        if (legacyLang && !profile.languagePreference) {
                            profile.languagePreference = legacyLang;
                            window.localStorage.removeItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
                            window.localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
                        }
                        return { ...DEFAULT_PROFILE, ...profile };
                    }
                }
            } else {
                // Fallback to localStorage if Cache API not supported
                const profileData = window.localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
                if (profileData) {
                    const profile = JSON.parse(profileData);
                    const legacyLang = window.localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
                    if (legacyLang && !profile.languagePreference) {
                        profile.languagePreference = legacyLang;
                        window.localStorage.removeItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
                        window.localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
                    }
                    return { ...DEFAULT_PROFILE, ...profile };
                }
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
            // Use Cache API for web platform
            if ('caches' in window) {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    const response = new Response(JSON.stringify(updatedProfile), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'
                        }
                    });
                    await cache.put(PROFILE_CACHE_KEY, response);
                    return true;
                } catch (cacheError) {
                    console.warn('Cache API not available, falling back to localStorage:', cacheError);
                    // Fallback to localStorage if Cache API fails
                    window.localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
                    return true;
                }
            } else {
                // Fallback to localStorage if Cache API not supported
                window.localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
                return true;
            }
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
            // Clear Cache API and localStorage for web
            if ('caches' in window) {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.delete(PROFILE_CACHE_KEY);
                } catch (cacheError) {
                    console.warn('Error clearing cache:', cacheError);
                }
            }
            // Also clear localStorage as fallback
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

/**
 * Clear entire cache (for maintenance/debugging)
 * @returns {Promise<boolean>} Success status
 */
export const clearCache = async () => {
    try {
        if (Platform.OS === 'web' && 'caches' in window) {
            await caches.delete(CACHE_NAME);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error clearing cache:', error);
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
