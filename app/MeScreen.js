import React, { useState, useEffect, useCallback } from 'react';
import * as Localization from 'expo-localization';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    useEffect(() => {
        let isMounted = true;

        const loadUserProfile = async () => {
            try {
                if (Platform.OS === 'web') {
                    // Use localStorage for web
                    const profileData = window.localStorage.getItem('userProfile');
                    if (profileData) {
                        const profile = JSON.parse(profileData);
                        if (isMounted) {
                            setUserProfile(profile);
                        }
                    } else {
                        // Create default profile
                        const defaultProfile = {
                            themePreference: isDarkMode ? 'dark' : 'light',
                            lastUpdated: new Date().toISOString(),
                            favoriteCount: 0,
                            languagePreference: currentLanguage
                        };
                        await saveUserProfile(defaultProfile);
                        if (isMounted) {
                            setUserProfile(defaultProfile);
                        }
                    }
                } else {
                    // Use FileSystem for mobile
                    const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                    const profileExists = await FileSystem.getInfoAsync(profileFile);

                    if (profileExists.exists) {
                        const profileContent = await FileSystem.readAsStringAsync(profileFile);
                        const profile = JSON.parse(profileContent);
                        if (isMounted) {
                            setUserProfile(profile);
                        }
                    } else {
                        // Create default profile
                        const defaultProfile = {
                            themePreference: isDarkMode ? 'dark' : 'light',
                            lastUpdated: new Date().toISOString(),
                            favoriteCount: 0,
                            languagePreference: currentLanguage
                        };
                        await saveUserProfile(defaultProfile);
                        if (isMounted) {
                            setUserProfile(defaultProfile);
                        }
                    }
                }
            } catch (error) {
                console.error(i18n.t('error_loading_user_profile') + ':', error);
            }
        };

        const loadFavorites = async () => {
            try {
                const stored = await AsyncStorage.getItem('favoriteUniversities');
                if (stored) {
                    const favorites = JSON.parse(stored);
                    if (isMounted) {
                        setFavoriteUniversities(favorites);

                        // Update profile state with current favorite count
                        const updatedProfile = {
                            ...userProfile,
                            favoriteCount: favorites.length,
                            lastUpdated: new Date().toISOString()
                        };
                        setUserProfile(updatedProfile);
                        // Note: We don't save here to avoid conflicts with context-managed preferences
                    }
                }
            } catch (error) {
                console.error(i18n.t('error_loading_favorites') + ':', error);
            }
        };

        loadUserProfile();
        loadFavorites();

        return () => {
            isMounted = false;
        };
    }, [currentLanguage, isDarkMode, userProfile]);

    // Refresh favorites every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            const loadFavorites = async () => {
                try {
                    const stored = await AsyncStorage.getItem('favoriteUniversities');
                    if (stored) {
                        const favorites = JSON.parse(stored);
                        if (isMounted) {
                            setFavoriteUniversities(favorites);

                            // Update profile state with current favorite count
                            const updatedProfile = {
                                ...userProfile,
                                favoriteCount: favorites.length,
                                lastUpdated: new Date().toISOString()
                            };
                            setUserProfile(updatedProfile);
                            // Note: We don't save here to avoid conflicts with context-managed preferences
                        }
                    }
                } catch (error) {
                    console.error(i18n.t('error_loading_favorites') + ':', error);
                }
            };

            loadFavorites();

            return () => {
                isMounted = false;
            };
        }, [userProfile])
    );

    // Save user profile to file
    const saveUserProfile = async (profile) => {
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
    };

    // Handle language change using LanguageContext
    const handleLanguageChange = async (lang) => {
        await changeLanguage(lang);
        setLanguageChanged(true);
        // LanguageContext handles the profile saving
    };

    // Restart app to apply language changes
    const restartApp = async () => {
        try {
            await Updates.reloadAsync();
        } catch (error) {
            console.error('Failed to restart app:', error);
            Alert.alert(i18n.t('error'), i18n.t('restart_failed'));
        }
    };

    const saveFavorites = async (favorites) => {
        try {
            await AsyncStorage.setItem('favoriteUniversities', JSON.stringify(favorites));

            // Update profile state with new favorite count
            const updatedProfile = {
                ...userProfile,
                favoriteCount: favorites.length,
                lastUpdated: new Date().toISOString()
            };
            setUserProfile(updatedProfile);

            // Update favorite count in profile without affecting other preferences
            await updateFavoriteCount(favorites.length);
        } catch (error) {
            console.error(i18n.t('error_saving_favorites') + ':', error);
        }
    };

    const removeFavorite = async (universityId) => {
        const updated = favoriteUniversities.filter(uni => uni.id !== universityId);
        setFavoriteUniversities(updated);
        await saveFavorites(updated);
    };

    const clearAllFavorites = async () => {
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
    };

    // Handle theme change and update profile
    const handleThemeToggle = async () => {
        // The ThemeContext now handles saving the theme preference
        toggleTheme();
        // Note: ThemeContext handles the profile saving
    };

    const viewProfile = async () => {
        try {
            if (Platform.OS === 'web') {
                // Get from localStorage for web
                const profileData = window.localStorage.getItem('userProfile');
                Alert.alert(i18n.t('user_profile'), profileData || i18n.t('no_profile_found'));
            } else {
                // Get from FileSystem for mobile
                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                const profileContent = await FileSystem.readAsStringAsync(profileFile);
                Alert.alert(i18n.t('user_profile'), profileContent || i18n.t('no_profile_found'));
            }
        } catch (error) {
            Alert.alert(i18n.t('error'), i18n.t('could_not_read_profile'));
        }
    };

    const resetProfile = async () => {
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
                            if (Platform.OS === 'web') {
                                // Clear from localStorage for web
                                window.localStorage.removeItem('userProfile');
                            } else {
                                // Delete from FileSystem for mobile
                                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                                await FileSystem.deleteAsync(profileFile, { idempotent: true });
                            }

                            const defaultProfile = {
                                themePreference: 'light',
                                lastUpdated: new Date().toISOString(),
                                favoriteCount: favoriteUniversities.length,
                                languagePreference: i18n.locale
                            };
                            setUserProfile(defaultProfile);
                            await saveUserProfile(defaultProfile);
                            Alert.alert(i18n.t('success'), i18n.t('profile_reset_success'));
                        } catch (error) {
                            Alert.alert(i18n.t('error'), i18n.t('could_not_reset_profile'));
                        }
                    }
                }
            ]
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Language Selection Card */}
                <Card style={[styles.card, { backgroundColor: theme.surface }]}>
                    <CardContent>
                        <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                            <Ionicons name="language-outline" size={20} color={theme.primary} style={styles.iconMargin} />
                            {i18n.t('language')}
                        </CardTitle>
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
                        <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                            <Ionicons name="color-palette-outline" size={20} color={theme.primary} style={styles.iconMargin} />
                            {i18n.t('theme_settings')}
                        </CardTitle>
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
                            <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                                <Ionicons name="heart-outline" size={20} color={theme.primary} style={styles.iconMargin} />
                                {i18n.t('favorite_universities')} ({favoriteUniversities.length})
                            </CardTitle>
                            {favoriteUniversities.length > 0 && (
                                <TouchableOpacity onPress={clearAllFavorites}>
                                    <Text style={[styles.clearText, { color: theme.primary }]}>{i18n.t('clear_all')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {favoriteUniversities.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="heart-dislike-outline" size={48} color={theme.textSecondary} />
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                    {i18n.t('no_favorites_yet')}
                                </Text>
                                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                                    {i18n.t('favorites_will_appear_here')}
                                </Text>
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
                                                        {university.name}
                                                    </CardTitle>
                                                    <CardSubtitle style={[styles.favSubtitle, { color: theme.textSecondary }]}>
                                                        {university.country || i18n.t('unknown_country')}
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
                        <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                            <Ionicons name="person-outline" size={20} color={theme.primary} style={styles.iconMargin} />
                            {i18n.t('user_profile')}
                        </CardTitle>
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

                        <View style={styles.buttonRow}>
                            <Button
                                title={i18n.t('view_profile')}
                                onPress={viewProfile}
                                variant="outline"
                                textStyle={{ color: theme.text }}
                                style={[styles.profileButton, { marginRight: 8, backgroundColor: theme.surfaceSecondary }]}
                            />
                            <Button
                                title={i18n.t('reset_profile')}
                                onPress={resetProfile}
                                variant="outline"
                                textStyle={{ color: theme.text }}
                                style={[styles.profileButton, { backgroundColor: theme.surfaceSecondary }]}
                            />
                        </View>
                    </CardContent>
                </Card>

                <View style={{ height: 20 }} />
            </ScrollView>
        </GestureHandlerRootView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconMargin: {
        marginRight: 8,
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
    buttonRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    profileButton: {
        flex: 1,
    },
});
