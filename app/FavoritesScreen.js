import React, { useState, useEffect, useCallback } from 'react';
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
import { updateFavoriteCount } from '../utils/profileUtils';

const FavoritesScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [favoriteUniversities, setFavoriteUniversities] = useState([]);
    const [userProfile, setUserProfile] = useState({
        themePreference: null,
        lastUpdated: null,
        favoriteCount: 0,
        languagePreference: null
    });

    // Load favorites from AsyncStorage
    const loadFavorites = useCallback(async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem('favoriteUniversities');
            if (storedFavorites) {
                const favorites = JSON.parse(storedFavorites);
                setFavoriteUniversities(favorites);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }, []);

    // Load user profile
    const loadUserProfile = useCallback(async () => {
        try {
            if (Platform.OS === 'web') {
                // Load from localStorage for web
                const profile = window.localStorage.getItem('userProfile');
                if (profile) {
                    setUserProfile(JSON.parse(profile));
                }
            } else {
                // Load from FileSystem for mobile
                const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                const profileExists = await FileSystem.getInfoAsync(profileFile);
                if (profileExists.exists) {
                    const profileContent = await FileSystem.readAsStringAsync(profileFile);
                    setUserProfile(JSON.parse(profileContent));
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }, []);

    // Save favorites to AsyncStorage and update profile count
    const saveFavorites = useCallback(async (favorites) => {
        try {
            await AsyncStorage.setItem('favoriteUniversities', JSON.stringify(favorites));
            // Update the favorite count in user profile
            await updateFavoriteCount(favorites.length);
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }, []);

    // Remove a favorite university
    const removeFavorite = useCallback(async (universityId) => {
        const updatedFavorites = favoriteUniversities.filter(fav => fav.id !== universityId);
        setFavoriteUniversities(updatedFavorites);
        await saveFavorites(updatedFavorites);
    }, [favoriteUniversities, saveFavorites]);

    // Clear all favorites
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

    useEffect(() => {
        loadFavorites();
        loadUserProfile();
    }, [loadFavorites, loadUserProfile]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerLeft}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        {i18n.t('favorite_universities')}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    {favoriteUniversities.length > 0 && (
                        <TouchableOpacity onPress={clearAllFavorites}>
                            <Text style={[styles.clearText, { color: theme.primary }]}>
                                {i18n.t('clear_all')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {favoriteUniversities.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={64} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.text }]}>
                            {i18n.t('no_favorites_yet')}
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                            {i18n.t('add_favorites_hint')}
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
                            <Card style={[styles.favCard, { backgroundColor: theme.surface }]}>
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
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

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
    backButton: {
        padding: 8,
    },
    headerLeft: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerRight: {
        minWidth: 60,
        alignItems: 'flex-end',
    },
    clearText: {
        fontSize: 14,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    favCard: {
        marginVertical: 8,
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
});

export default FavoritesScreen;