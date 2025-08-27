import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as FileSystem from 'expo-file-system';

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
        loadSavedThemePreference();
    }, []);

    const loadSavedThemePreference = async () => {
        try {
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            const profileExists = await FileSystem.getInfoAsync(profileFile);

            if (profileExists.exists) {
                const profileContent = await FileSystem.readAsStringAsync(profileFile);
                const profile = JSON.parse(profileContent);

                if (profile.themePreference) {
                    setIsDarkMode(profile.themePreference === 'dark');
                } else {
                    // If no preference is saved, use system preference
                    setIsDarkMode(systemColorScheme === 'dark');
                }
            } else {
                // No profile exists, use system preference
                setIsDarkMode(systemColorScheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
            // Fallback to system preference on error
            setIsDarkMode(systemColorScheme === 'dark');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);

        // Save the new theme preference to the profile file
        try {
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            let profile = {
                themePreference: newTheme ? 'dark' : 'light',
                lastUpdated: new Date().toISOString(),
                favoriteCount: 0
            };

            // Try to load existing profile and update it
            const profileExists = await FileSystem.getInfoAsync(profileFile);
            if (profileExists.exists) {
                const existingProfileContent = await FileSystem.readAsStringAsync(profileFile);
                const existingProfile = JSON.parse(existingProfileContent);
                profile = {
                    ...existingProfile,
                    themePreference: newTheme ? 'dark' : 'light',
                    lastUpdated: new Date().toISOString()
                };
            }

            await FileSystem.writeAsStringAsync(profileFile, JSON.stringify(profile, null, 2));
        } catch (error) {
            console.error('Error saving theme preference:', error);
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
