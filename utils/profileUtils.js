import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Updates the favorite count in the user profile
 * @param {number} count - The new favorite count
 */
export const updateFavoriteCount = async (count) => {
    try {
        // Load current profile
        let profile;
        if (Platform.OS === 'web') {
            const profileData = window.localStorage.getItem('userProfile');
            profile = profileData ? JSON.parse(profileData) : {};
        } else {
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            const profileExists = await FileSystem.getInfoAsync(profileFile);
            if (profileExists.exists) {
                const profileContent = await FileSystem.readAsStringAsync(profileFile);
                profile = JSON.parse(profileContent);
            } else {
                profile = {};
            }
        }

        // Update favorite count and last updated timestamp
        profile.favoriteCount = count;
        profile.lastUpdated = new Date().toISOString();

        // Save updated profile
        if (Platform.OS === 'web') {
            window.localStorage.setItem('userProfile', JSON.stringify(profile));
        } else {
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            await FileSystem.writeAsStringAsync(profileFile, JSON.stringify(profile, null, 2));
        }
    } catch (error) {
        console.error('Error updating favorite count:', error);
    }
};

/**
 * Gets the current favorite count from AsyncStorage
 * @returns {Promise<number>} The current favorite count
 */
export const getFavoriteCount = async () => {
    try {
        const favoritesData = await AsyncStorage.getItem('favoriteUniversities');
        if (favoritesData) {
            const favorites = JSON.parse(favoritesData);
            return Array.isArray(favorites) ? favorites.length : 0;
        }
        return 0;
    } catch (error) {
        console.error('Error getting favorite count:', error);
        return 0;
    }
};