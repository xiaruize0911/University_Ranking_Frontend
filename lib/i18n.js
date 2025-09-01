import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { Platform } from 'react-native';
import { getLanguagePreference, saveLanguagePreference } from './preferences';
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
        const savedLang = await getLanguagePreference();
        if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
            i18n.locale = savedLang;
            return savedLang;
        }
    } catch (error) {
        console.error(i18n.t('error_loading_language_preference') + ':', error);
    }
    return i18n.locale;
};

// Re-export saveLanguagePreference from preferences for backward compatibility
export { saveLanguagePreference };

export default i18n;
