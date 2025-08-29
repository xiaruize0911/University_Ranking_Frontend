import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import en from '../locales/en.json';
import zh from '../locales/zh.json';

// Create a new I18n instance
const i18n = new I18n();

// Configure translations
i18n.translations = { en, zh };
i18n.fallbacks = true;
i18n.defaultLocale = 'en';

// Initialize with device language as fallback
const deviceLanguage = Localization.locale || 'en';
i18n.locale = deviceLanguage.startsWith('zh') ? 'zh' : 'en';

// Function to load saved language preference
export const loadSavedLanguagePreference = async () => {
    try {
        if (Platform.OS === 'web') {
            // Use localStorage for web
            const savedLang = window.localStorage.getItem('languagePreference');
            if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
                i18n.locale = savedLang;
                return savedLang;
            }
        } else {
            // Use FileSystem for mobile
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            const profileExists = await FileSystem.getInfoAsync(profileFile);
            if (profileExists.exists) {
                const profileContent = await FileSystem.readAsStringAsync(profileFile);
                const profile = JSON.parse(profileContent);
                if (profile.languagePreference && (profile.languagePreference === 'en' || profile.languagePreference === 'zh')) {
                    i18n.locale = profile.languagePreference;
                    return profile.languagePreference;
                }
            }
        }
    } catch (error) {
        console.error(i18n.t('error_loading_language_preference') + ':', error);
    }
    return i18n.locale;
};

// Function to save language preference
export const saveLanguagePreference = async (language) => {
    i18n.locale = language;

    try {
        if (Platform.OS === 'web') {
            // Save to localStorage for web
            window.localStorage.setItem('languagePreference', language);
        } else {
            // Save to FileSystem for mobile
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            let profile = {
                languagePreference: language,
                lastUpdated: new Date().toISOString()
            };

            const profileExists = await FileSystem.getInfoAsync(profileFile);
            if (profileExists.exists) {
                const existingProfileContent = await FileSystem.readAsStringAsync(profileFile);
                const existingProfile = JSON.parse(existingProfileContent);
                profile = {
                    ...existingProfile,
                    languagePreference: language,
                    lastUpdated: new Date().toISOString()
                };
            } else {
                // Create default profile with only language preference
                profile = {
                    languagePreference: language,
                    themePreference: 'light',
                    favoriteCount: 0,
                    lastUpdated: new Date().toISOString()
                };
            }
            await FileSystem.writeAsStringAsync(profileFile, JSON.stringify(profile, null, 2));
        }
    } catch (error) {
        console.error(i18n.t('error_saving_language_preference') + ':', error);
    }
};

export default i18n;
