import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Localization from 'expo-localization';
import i18n, { loadSavedLanguagePreference, saveLanguagePreference } from '../lib/i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved language preference on app startup
    useEffect(() => {
        let isMounted = true;

        const loadLanguagePreference = async () => {
            try {
                const savedLang = await loadSavedLanguagePreference();
                if (savedLang && (savedLang === 'en' || savedLang === 'zh') && isMounted) {
                    setCurrentLanguage(savedLang);
                    i18n.locale = savedLang;
                } else if (isMounted) {
                    // Use device language as fallback
                    const deviceLang = Localization.locale.startsWith('zh') ? 'zh' : 'en';
                    setCurrentLanguage(deviceLang);
                    i18n.locale = deviceLang;
                }
            } catch (error) {
                console.error('Error loading language preference:', error);
                if (isMounted) {
                    // Fallback to device language
                    const deviceLang = Localization.locale.startsWith('zh') ? 'zh' : 'en';
                    setCurrentLanguage(deviceLang);
                    i18n.locale = deviceLang;
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadLanguagePreference();

        return () => {
            isMounted = false;
        };
    }, []);

    const changeLanguage = async (newLanguage) => {
        if (newLanguage !== currentLanguage && (newLanguage === 'en' || newLanguage === 'zh')) {
            setCurrentLanguage(newLanguage);
            i18n.locale = newLanguage;
            await saveLanguagePreference(newLanguage);
        }
    };

    // Show loading screen while language is being loaded
    if (isLoading) {
        return null; // or a loading component
    }

    return (
        <LanguageContext.Provider value={{
            currentLanguage,
            changeLanguage,
            isEnglish: currentLanguage === 'en',
            isChinese: currentLanguage === 'zh'
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
