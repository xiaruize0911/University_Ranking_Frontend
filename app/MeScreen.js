import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as Localization from 'expo-localization';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Alert, Platform, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { translateText, updateFavoriteCount } from '../lib/api';

export default function MeScreen() {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { currentLanguage, changeLanguage, isEnglish, isChinese } = useLanguage();
    const navigation = useNavigation();
    const [favoriteUniversities, setFavoriteUniversities] = useState([]);
    const [userProfile, setUserProfile] = useState({
        themePreference: 'light',
        lastUpdated: null,
        favoriteCount: 0,
        languagePreference: undefined
    });
    const [languageChanged, setLanguageChanged] = useState(false);

    // Load user profile and favorites on initial mount
    const loadUserProfile = useCallback(async () => {
        try {
            if (Platform.OS === 'web') {
                // Use localStorage for web
                const profileData = window.localStorage.getItem('userProfile');
                if (profileData) {
                    const profile = JSON.parse(profileData);
                    setUserProfile(profile);
                } else {
                    // Create default profile
                    const defaultProfile = {
                        themePreference: isDarkMode ? 'dark' : 'light',
                        lastUpdated: new Date().toISOString(),
                        favoriteCount: 0,
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
                    setUserProfile(profile);
                } else {
                    // Create default profile
                    const defaultProfile = {
                        themePreference: isDarkMode ? 'dark' : 'light',
                        lastUpdated: new Date().toISOString(),
                        favoriteCount: 0,
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

    const loadFavorites = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem('favoriteUniversities');
            if (stored) {
                const favorites = JSON.parse(stored);
                setFavoriteUniversities(favorites);

                // Update profile state with current favorite count
                setUserProfile(prev => ({
                    ...prev,
                    favoriteCount: favorites.length,
                    lastUpdated: new Date().toISOString()
                }));
                // Note: We don't save here to avoid conflicts with context-managed preferences
            }
        } catch (error) {
            console.error(i18n.t('error_loading_favorites') + ':', error);
        }
    }, []);

    // Load user profile and favorites on initial mount
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            await loadUserProfile();
            await loadFavorites();
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [loadUserProfile, loadFavorites]);

    // Refresh favorites every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            loadFavorites();

            return () => {
                isMounted = false;
            };
        }, [loadFavorites])
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
            await Updates.reloadAsync();
        } catch (error) {
            console.error('Failed to restart app:', error);
            Alert.alert(i18n.t('error'), i18n.t('restart_failed'));
        }
    }, []);

    const saveFavorites = useCallback(async (favorites) => {
        try {
            await AsyncStorage.setItem('favoriteUniversities', JSON.stringify(favorites));

            // Update profile state with new favorite count
            setUserProfile(prev => ({
                ...prev,
                favoriteCount: favorites.length,
                lastUpdated: new Date().toISOString()
            }));

            // Update favorite count in profile without affecting other preferences
            await updateFavoriteCount(favorites.length);
        } catch (error) {
            console.error(i18n.t('error_saving_favorites') + ':', error);
        }
    }, []);

    const removeFavorite = useCallback(async (universityId) => {
        const updated = favoriteUniversities.filter(uni => uni.id !== universityId);
        setFavoriteUniversities(updated);
        await saveFavorites(updated);
    }, [favoriteUniversities, saveFavorites]);

    const clearAllFavorites = useCallback(async () => {
        Alert.alert(
            i18n.t('clear_all_favorites'),
            i18n.t('clear_all_favorites_confirm'),
            [
                { text: i18n.t('cancel'), style: "cancel" },
                {
                    text: i18n.t('clear'),
                    style: "destructive",
                    onPress: async () => {
                        setFavoriteUniversities([]);
                        await saveFavorites([]);
                    }
                }
            ]
        );
    }, [saveFavorites]);

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
                            setFavoriteUniversities([]);
                            setLanguageChanged(false);

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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Header - match Search.js style */}
                <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>{i18n.t('me')}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Ionicons name="person-circle-outline" size={28} color={theme.text} style={{ marginLeft: 8 }} />
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
                            <Button
                                title={isDarkMode ? i18n.t('switch_to_light') : i18n.t('switch_to_dark')}
                                onPress={handleThemeToggle}
                                variant="outline"
                                textStyle={{ color: theme.text }}
                                style={[styles.themeButton, { backgroundColor: theme.surfaceSecondary }]}
                            />
                        </CardContent>
                    </Card>

                    {/* Favorite Universities Card */}
                    <Card style={[styles.card, { backgroundColor: theme.surface }]}>
                        <CardContent>
                            <View style={styles.headerRow}>
                                <View style={styles.cardTitleContainer}>
                                    <Ionicons name="heart-outline" size={20} color={theme.primary} />
                                    <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                                        {i18n.t('favorite_universities')} ({favoriteUniversities.length})
                                    </CardTitle>
                                </View>
                                {favoriteUniversities.length > 0 && (
                                    <TouchableOpacity onPress={clearAllFavorites}>
                                        <Text style={[styles.clearText, { color: theme.primary }]}>{i18n.t('clear_all')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {favoriteUniversities.length === 0 ? (
                                <View style={styles.emptyState}>
                                </View>
                            ) : (
                                favoriteUniversities.map((university, index) => (
                                    <TouchableOpacity
                                        key={university.id || index}
                                        onPress={() => navigation.navigate('DetailPage', {
                                            normalized_name: university.normalized_name,
                                            name: university.name
                                        })}
                                        activeOpacity={0.7}
                                    >
                                        <Card style={[styles.favCard, { backgroundColor: theme.surfaceSecondary }]}>
                                            <CardContent>
                                                <View style={styles.favRow}>
                                                    <View style={styles.favInfo}>
                                                        <CardTitle style={[styles.favTitle, { color: theme.text }]}>
                                                            {university.name || ''}
                                                        </CardTitle>
                                                        <CardSubtitle style={[styles.favSubtitle, { color: theme.textSecondary }]}>
                                                            {university.country || ''}
                                                        </CardSubtitle>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.stopPropagation(); // Prevent navigation when removing favorite
                                                            removeFavorite(university.id);
                                                        }}
                                                        style={styles.removeButton}
                                                    >
                                                        <Ionicons name="heart-dislike" size={24} color={theme.primary} />
                                                    </TouchableOpacity>
                                                </View>
                                            </CardContent>
                                        </Card>
                                    </TouchableOpacity>
                                ))
                            )}
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
                                    {i18n.t('theme_preference')}: <Text style={{ color: theme.primary }}>{userProfile.themePreference}</Text>
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
        </GestureHandlerRootView >
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
    resetButton: {
        width: '100%',
    },
});
