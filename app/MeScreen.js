import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as Localization from 'expo-localization';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Alert, Platform, SafeAreaView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/Button';
import { Card, CardContent, CardTitle, CardSubtitle } from '../components/Card';
import Ionicons from '@expo/vector-icons/Ionicons';
import i18n from '../lib/i18n';

export default function MeScreen() {
    const { theme, isDarkMode, themeMode, toggleTheme, resetTheme, setThemeModeDirectly } = useTheme();
    const { currentLanguage, changeLanguage, isEnglish, isChinese } = useLanguage();
    const navigation = useNavigation();
    const [userProfile, setUserProfile] = useState({
        themePreference: null,
        lastUpdated: null,
        favoriteCount: 0,
        languagePreference: null
    });
    const [languageChanged, setLanguageChanged] = useState(false);

    // Load user profile and favorites on initial mount
    const loadUserProfile = useCallback(async () => {
        try {
            // Load favorite count from AsyncStorage
            let favoriteCount = 0;
            try {
                const favoritesData = await AsyncStorage.getItem('favoriteUniversities');
                if (favoritesData) {
                    const favorites = JSON.parse(favoritesData);
                    favoriteCount = Array.isArray(favorites) ? favorites.length : 0;
                }
            } catch (favError) {
                console.error('Error loading favorites:', favError);
            }

            if (Platform.OS === 'web') {
                // Use localStorage for web
                const profileData = window.localStorage.getItem('userProfile');
                if (profileData) {
                    const profile = JSON.parse(profileData);
                    profile.favoriteCount = favoriteCount;
                    setUserProfile(profile);
                } else {
                    // Create default profile
                    const defaultProfile = {
                        themePreference: 'auto',
                        lastUpdated: new Date().toISOString(),
                        favoriteCount: favoriteCount,
                        languagePreference: currentLanguage
                    };
                    await saveUserProfile(defaultProfile);
                    setUserProfile(defaultProfile);
                }
            } else {
                // Use FileSystem for mobile
                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                const profileExists = await FileSystem.getInfoAsync(profileFile);

                if (profileExists.exists) {
                    const profileContent = await FileSystem.readAsStringAsync(profileFile);
                    const profile = JSON.parse(profileContent);
                    profile.favoriteCount = favoriteCount;
                    setUserProfile(profile);
                } else {
                    // Create default profile
                    const defaultProfile = {
                        themePreference: 'auto',
                        lastUpdated: new Date().toISOString(),
                        favoriteCount: favoriteCount,
                        languagePreference: currentLanguage
                    };
                    await saveUserProfile(defaultProfile);
                    setUserProfile(defaultProfile);
                }
            }
        } catch (error) {
            console.error(i18n.t('error_loading_user_profile') + ':', error);
        }
    }, [currentLanguage, isDarkMode, saveUserProfile]);

    // Load user profile and favorites on initial mount
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            await loadUserProfile();
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [loadUserProfile]);

    // Refresh profile when screen comes back into focus (e.g., returning from FavoritesScreen)
    useFocusEffect(
        useCallback(() => {
            loadUserProfile();
        }, [loadUserProfile])
    );

    // Save user profile to file
    const saveUserProfile = useCallback(async (profile) => {
        try {
            if (Platform.OS === 'web') {
                // Save to localStorage for web
                window.localStorage.setItem('userProfile', JSON.stringify(profile));
            } else {
                // Save to FileSystem for mobile
                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                await FileSystem.writeAsStringAsync(profileFile, JSON.stringify(profile, null, 2));
            }
        } catch (error) {
            console.error(i18n.t('error_saving_user_profile') + ':', error);
        }
    }, []);

    // Handle language change using LanguageContext
    const handleLanguageChange = useCallback(async (lang) => {
        await changeLanguage(lang);
        setLanguageChanged(true);
        // LanguageContext handles the profile saving
    }, [changeLanguage]);

    // Restart app to apply language changes
    const restartApp = useCallback(async () => {
        try {
            // Reset the language changed flag before restarting
            setLanguageChanged(false);
            await Updates.reloadAsync();
        } catch (error) {
            console.error('Failed to restart app:', error);
            Alert.alert(i18n.t('error'), i18n.t('restart_failed'));
        }
    }, []);

    // Handle theme change and update profile
    const handleThemeToggle = useCallback(async () => {
        // The ThemeContext now handles saving the theme preference
        toggleTheme();
        // Note: ThemeContext handles the profile saving
    }, [toggleTheme]);

    const resetProfile = useCallback(async () => {
        Alert.alert(
            i18n.t('reset_profile'),
            i18n.t('reset_profile_confirm'),
            [
                { text: i18n.t('cancel'), style: "cancel" },
                {
                    text: i18n.t('reset'),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Clear all stored data
                            if (Platform.OS === 'web') {
                                // Clear from localStorage for web
                                window.localStorage.removeItem('userProfile');
                            } else {
                                // Delete from FileSystem for mobile
                                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                                await FileSystem.deleteAsync(profileFile, { idempotent: true });
                            }

                            // Clear favorites from AsyncStorage
                            await AsyncStorage.removeItem('favoriteUniversities');

                            // Reset all state to empty values
                            const emptyProfile = {
                                themePreference: null,
                                lastUpdated: null,
                                favoriteCount: 0,
                                languagePreference: null
                            };

                            setUserProfile(emptyProfile);
                            setLanguageChanged(false);

                            // Reset theme to auto mode
                            await resetTheme();

                            // Don't save the empty profile - just reset the state
                            Alert.alert(i18n.t('success'), i18n.t('profile_reset_success'));
                        } catch (error) {
                            console.error('Error resetting profile:', error);
                            Alert.alert(i18n.t('error'), i18n.t('could_not_reset_profile'));
                        }
                    }
                }
            ]
        );
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header - match Search.js style */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{i18n.t('Profile')}</Text>
                </View>
            </View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Language Selection Card */}
                <Card style={[styles.card, { backgroundColor: theme.surface }]}>
                    <CardContent>
                        <View style={styles.cardTitleContainer}>
                            <Ionicons name="language-outline" size={20} color={theme.primary} />
                            <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                                {i18n.t('language')}
                            </CardTitle>
                        </View>
                        <Text style={{ color: theme.textSecondary, marginBottom: 8 }}>
                            {i18n.t('selected_language')}: {isChinese ? i18n.t('chinese') : i18n.t('english')}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Button
                                    title={i18n.t('english')}
                                    onPress={() => handleLanguageChange('en')}
                                    variant={isEnglish ? 'solid' : 'outline'}
                                    textStyle={{ color: isEnglish ? theme.surface : theme.text }}
                                    style={{ backgroundColor: isEnglish ? theme.primary : theme.surfaceSecondary }}
                                />
                                <Button
                                    title={i18n.t('chinese')}
                                    onPress={() => handleLanguageChange('zh')}
                                    variant={isChinese ? 'solid' : 'outline'}
                                    textStyle={{ color: isChinese ? theme.surface : theme.text }}
                                    style={{ backgroundColor: isChinese ? theme.primary : theme.surfaceSecondary }}
                                />
                            </View>
                            {languageChanged && (
                                <Button
                                    title={i18n.t('restart_app')}
                                    onPress={restartApp}
                                    variant="solid"
                                    textStyle={{ color: theme.surface }}
                                    style={{ backgroundColor: theme.primary, paddingHorizontal: 16 }}
                                />
                            )}
                        </View>
                    </CardContent>
                </Card>

                {/* Theme Selection Card */}
                <Card style={[styles.card, { backgroundColor: theme.surface }]}>
                    <CardContent>
                        <View style={styles.cardTitleContainer}>
                            <Ionicons name="color-palette-outline" size={20} color={theme.primary} />
                            <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                                {i18n.t('theme_settings')}
                            </CardTitle>
                        </View>
                        <Text style={{ color: theme.textSecondary, marginBottom: 12 }}>
                            {i18n.t('current_mode')}: {
                                themeMode === 'light' ? i18n.t('light_mode') :
                                    themeMode === 'dark' ? i18n.t('dark_mode') :
                                        i18n.t('auto_mode')
                            }
                        </Text>
                        <View style={styles.themeButtonsRow}>
                            <Button
                                title={i18n.t('auto_mode')}
                                onPress={() => setThemeModeDirectly('auto')}
                                variant={themeMode === 'auto' ? 'solid' : 'outline'}
                                textStyle={{ color: themeMode === 'auto' ? theme.surface : theme.text }}
                                style={[styles.themeModeButton, { backgroundColor: themeMode === 'auto' ? theme.primary : theme.surfaceSecondary }]}
                            />
                            <Button
                                title={i18n.t('light_mode')}
                                onPress={() => setThemeModeDirectly('light')}
                                variant={themeMode === 'light' ? 'solid' : 'outline'}
                                textStyle={{ color: themeMode === 'light' ? theme.surface : theme.text }}
                                style={[styles.themeModeButton, { backgroundColor: themeMode === 'light' ? theme.primary : theme.surfaceSecondary }]}
                            />
                            <Button
                                title={i18n.t('dark_mode')}
                                onPress={() => setThemeModeDirectly('dark')}
                                variant={themeMode === 'dark' ? 'solid' : 'outline'}
                                textStyle={{ color: themeMode === 'dark' ? theme.surface : theme.text }}
                                style={[styles.themeModeButton, { backgroundColor: themeMode === 'dark' ? theme.primary : theme.surfaceSecondary }]}
                            />
                        </View>
                    </CardContent>
                </Card>

                {/* Favorites Card */}
                <Card style={[styles.card, { backgroundColor: theme.surface }]}>
                    <CardContent>
                        <View style={styles.cardTitleContainer}>
                            <Ionicons name="heart-outline" size={20} color={theme.primary} />
                            <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                                {i18n.t('favorite_universities')}
                            </CardTitle>
                        </View>
                        <Text style={[styles.favoritesDescription, { color: theme.textSecondary }]}>
                            {i18n.t('manage_your_favorite_universities')}
                        </Text>
                        <Button
                            title={i18n.t('view_favorites')}
                            onPress={() => navigation.navigate('FavoritesScreen')}
                            variant="outline"
                            textStyle={{ color: theme.text }}
                            style={[styles.favoritesButton, { backgroundColor: theme.surfaceSecondary }]}
                        />
                    </CardContent>
                </Card>

                {/* User Profile Card */}
                <Card style={[styles.card, { backgroundColor: theme.surface }]}>
                    <CardContent>
                        <View style={styles.cardTitleContainer}>
                            <Ionicons name="person-outline" size={20} color={theme.primary} />
                            <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                                {i18n.t('user_profile')}
                            </CardTitle>
                        </View>
                        <Text style={[styles.profileDescription, { color: theme.textSecondary }]}>
                            {i18n.t('profile_description')}
                        </Text>

                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileItem, { color: theme.text }]}>
                                {i18n.t('theme_preference')}: <Text style={{ color: theme.primary }}>{
                                    themeMode === 'light' ? i18n.t('light_mode') :
                                        themeMode === 'dark' ? i18n.t('dark_mode') :
                                            i18n.t('auto_mode')
                                }</Text>
                            </Text>
                            <Text style={[styles.profileItem, { color: theme.text }]}>
                                {i18n.t('language')}: <Text style={{ color: theme.primary }}>{isChinese ? i18n.t('chinese') : i18n.t('english')}</Text>
                            </Text>
                            <Text style={[styles.profileItem, { color: theme.text }]}>
                                {i18n.t('favorite_universities')}: <Text style={{ color: theme.primary }}>{userProfile.favoriteCount}</Text>
                            </Text>
                            {userProfile.lastUpdated && (
                                <Text style={[styles.profileItem, { color: theme.textSecondary }]}>
                                    {i18n.t('last_updated')}: {new Date(userProfile.lastUpdated).toLocaleDateString()}
                                </Text>
                            )}
                        </View>

                        <View style={styles.buttonContainer}>
                            <Button
                                title={i18n.t('reset_profile')}
                                onPress={resetProfile}
                                variant="outline"
                                textStyle={{ color: theme.text }}
                                style={[styles.resetButton, { backgroundColor: theme.surfaceSecondary }]}
                            />
                        </View>
                    </CardContent>
                </Card>


                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    card: {
        marginVertical: 8,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingTop: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    themeButton: {
        marginTop: 8,
    },
    themeButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    themeModeButton: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clearText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 12,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    favCard: {
        marginBottom: 8,
    },
    favRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    favInfo: {
        flex: 1,
    },
    favTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    favSubtitle: {
        fontSize: 14,
    },
    removeButton: {
        padding: 8,
    },
    profileDescription: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    profileInfo: {
        marginBottom: 16,
    },
    profileItem: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    buttonContainer: {
        marginBottom: 16,
    },
    viewFavoritesButton: {
        marginBottom: 12,
    },
    resetButton: {
        width: '100%',
    },
    favoritesDescription: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    favoritesButton: {
        width: '100%',
    },
});
