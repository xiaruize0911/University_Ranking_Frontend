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
    const [themeMode, setThemeMode] = useState('auto'); // 'light', 'dark', or 'auto'
    const [isLoading, setIsLoading] = useState(true);

    // Determine if dark mode should be active based on themeMode
    const isDarkMode = themeMode === 'auto' ? systemColorScheme === 'dark' : themeMode === 'dark';

    // Load saved theme preference on app startup
    useEffect(() => {
        let isMounted = true;

        const loadSavedThemePreference = async () => {
            try {
                if (Platform.OS === 'web') {
                    // Use localStorage for web
                    const themePref = window.localStorage.getItem('themePreference');
                    if (themePref && isMounted) {
                        setThemeMode(themePref);
                    } else if (isMounted) {
                        setThemeMode('auto');
                    }
                } else {
                    // Use FileSystem for mobile
                    const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                    const profileExists = await FileSystem.getInfoAsync(profileFile);
                    if (profileExists.exists) {
                        const profileContent = await FileSystem.readAsStringAsync(profileFile);
                        const profile = JSON.parse(profileContent);
                        if (profile.themePreference && isMounted) {
                            setThemeMode(profile.themePreference);
                        } else if (isMounted) {
                            setThemeMode('auto');
                        }
                    } else if (isMounted) {
                        setThemeMode('auto');
                    }
                }
            } catch (error) {
                console.error(i18n.t('error_loading_theme_preference') + ':', error);
                if (isMounted) {
                    setThemeMode('auto');
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
        const nextMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'auto' : 'light';
        setThemeMode(nextMode);

        try {
            if (Platform.OS === 'web') {
                // Save to localStorage for web
                window.localStorage.setItem('themePreference', nextMode);
            } else {
                // Save to FileSystem for mobile
                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                let profile = {
                    themePreference: nextMode,
                    lastUpdated: new Date().toISOString()
                };

                const profileExists = await FileSystem.getInfoAsync(profileFile);
                if (profileExists.exists) {
                    const existingProfileContent = await FileSystem.readAsStringAsync(profileFile);
                    const existingProfile = JSON.parse(existingProfileContent);
                    profile = {
                        ...existingProfile,
                        themePreference: nextMode,
                        lastUpdated: new Date().toISOString()
                    };
                } else {
                    // Create default profile with only theme preference
                    profile = {
                        themePreference: nextMode,
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

    const resetTheme = async () => {
        setThemeMode('auto');

        try {
            if (Platform.OS === 'web') {
                // Clear from localStorage for web
                window.localStorage.removeItem('themePreference');
            } else {
                // Clear from FileSystem for mobile
                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                const profileExists = await FileSystem.getInfoAsync(profileFile);
                if (profileExists.exists) {
                    const existingProfileContent = await FileSystem.readAsStringAsync(profileFile);
                    const existingProfile = JSON.parse(existingProfileContent);
                    const updatedProfile = {
                        ...existingProfile,
                        themePreference: 'auto',
                        lastUpdated: new Date().toISOString()
                    };
                    await FileSystem.writeAsStringAsync(profileFile, JSON.stringify(updatedProfile, null, 2));
                }
            }
        } catch (error) {
            console.error(i18n.t('error_saving_theme_preference') + ':', error);
        }
    };

    const setThemeModeDirectly = async (newMode) => {
        setThemeMode(newMode);

        try {
            if (Platform.OS === 'web') {
                // Save to localStorage for web
                window.localStorage.setItem('themePreference', newMode);
            } else {
                // Save to FileSystem for mobile
                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                let profile = {
                    themePreference: newMode,
                    lastUpdated: new Date().toISOString()
                };

                const profileExists = await FileSystem.getInfoAsync(profileFile);
                if (profileExists.exists) {
                    const existingProfileContent = await FileSystem.readAsStringAsync(profileFile);
                    const existingProfile = JSON.parse(existingProfileContent);
                    profile = {
                        ...existingProfile,
                        themePreference: newMode,
                        lastUpdated: new Date().toISOString()
                    };
                } else {
                    // Create default profile with only theme preference
                    profile = {
                        themePreference: newMode,
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
        <ThemeContext.Provider value={{ theme, isDarkMode, themeMode, toggleTheme, resetTheme, setThemeModeDirectly }}>
            {children}
        </ThemeContext.Provider>
    );
};
