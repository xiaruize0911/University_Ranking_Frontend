import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Localization from 'expo-localization';
import i18n from '../lib/i18n';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const lightTheme = {
    background: '#f8f9fa',
    surface: '#ffffff',
    surfaceSecondary: '#f1f3f5',
    primary: '#4a90e2',
    text: '#2c3e50',
    textSecondary: '#6c757d',
    border: '#e1e5e9',
    card: '#ffffff',
    input: '#ffffff',
    shadow: '#000',
};

export const darkTheme = {
    background: '#121212',
    surface: '#1e1e1e',
    surfaceSecondary: '#434343ff',
    primary: '#4a90e2',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    border: '#333333',
    card: '#2a2a2a',
    input: '#2a2a2a',
    shadow: '#000',
};

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme preference on app startup
    useEffect(() => {
        let isMounted = true;

        const loadSavedThemePreference = async () => {
            try {
                if (Platform.OS === 'web') {
                    // Use localStorage for web
                    const themePref = window.localStorage.getItem('themePreference');
                    if (themePref && isMounted) {
                        setIsDarkMode(themePref === 'dark');
                    } else if (isMounted) {
                        setIsDarkMode(systemColorScheme === 'dark');
                    }
                } else {
                    // Use FileSystem for mobile
                    const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                    const profileExists = await FileSystem.getInfoAsync(profileFile);
                    if (profileExists.exists) {
                        const profileContent = await FileSystem.readAsStringAsync(profileFile);
                        const profile = JSON.parse(profileContent);
                        if (profile.themePreference && isMounted) {
                            setIsDarkMode(profile.themePreference === 'dark');
                        } else if (isMounted) {
                            setIsDarkMode(systemColorScheme === 'dark');
                        }
                    } else if (isMounted) {
                        setIsDarkMode(systemColorScheme === 'dark');
                    }
                }
            } catch (error) {
                console.error(i18n.t('error_loading_theme_preference') + ':', error);
                if (isMounted) {
                    setIsDarkMode(systemColorScheme === 'dark');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadSavedThemePreference();

        return () => {
            isMounted = false;
        };
    }, [systemColorScheme]);

    const toggleTheme = async () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);

        try {
            if (Platform.OS === 'web') {
                // Save to localStorage for web
                window.localStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
            } else {
                // Save to FileSystem for mobile
                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                let profile = {
                    themePreference: newTheme ? 'dark' : 'light',
                    lastUpdated: new Date().toISOString()
                };

                const profileExists = await FileSystem.getInfoAsync(profileFile);
                if (profileExists.exists) {
                    const existingProfileContent = await FileSystem.readAsStringAsync(profileFile);
                    const existingProfile = JSON.parse(existingProfileContent);
                    profile = {
                        ...existingProfile,
                        themePreference: newTheme ? 'dark' : 'light',
                        lastUpdated: new Date().toISOString()
                    };
                } else {
                    // Create default profile with only theme preference
                    profile = {
                        themePreference: newTheme ? 'dark' : 'light',
                        languagePreference: 'en',
                        favoriteCount: 0,
                        lastUpdated: new Date().toISOString()
                    };
                }
                await FileSystem.writeAsStringAsync(profileFile, JSON.stringify(profile, null, 2));
            }
        } catch (error) {
            console.error(i18n.t('error_saving_theme_preference') + ':', error);
        }
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    // Show loading screen while theme is being loaded
    if (isLoading) {
        return null; // or a loading component
    }

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
