import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import { Card, CardContent, CardTitle, CardSubtitle } from '../components/Card';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function MeScreen() {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const navigation = useNavigation();
    const [favoriteUniversities, setFavoriteUniversities] = useState([]);
    const [userProfile, setUserProfile] = useState({
        themePreference: 'light',
        lastUpdated: null,
        favoriteCount: 0
    });

    // Load user profile and favorites on initial mount
    useEffect(() => {
        loadUserProfile();
        loadFavorites();
    }, []);

    // Refresh favorites every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    // Load user profile from file
    const loadUserProfile = async () => {
        try {
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
                    favoriteCount: 0
                };
                await saveUserProfile(defaultProfile);
                setUserProfile(defaultProfile);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    // Save user profile to file
    const saveUserProfile = async (profile) => {
        try {
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            await FileSystem.writeAsStringAsync(profileFile, JSON.stringify(profile, null, 2));
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    };

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem('favoriteUniversities');
            if (stored) {
                const favorites = JSON.parse(stored);
                setFavoriteUniversities(favorites);

                // Update profile with current favorite count
                const updatedProfile = {
                    ...userProfile,
                    favoriteCount: favorites.length,
                    lastUpdated: new Date().toISOString()
                };
                setUserProfile(updatedProfile);
                await saveUserProfile(updatedProfile);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const saveFavorites = async (favorites) => {
        try {
            await AsyncStorage.setItem('favoriteUniversities', JSON.stringify(favorites));

            // Update profile with new favorite count
            const updatedProfile = {
                ...userProfile,
                favoriteCount: favorites.length,
                lastUpdated: new Date().toISOString()
            };
            setUserProfile(updatedProfile);
            await saveUserProfile(updatedProfile);
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    };

    const removeFavorite = async (universityId) => {
        const updated = favoriteUniversities.filter(uni => uni.id !== universityId);
        setFavoriteUniversities(updated);
        await saveFavorites(updated);
    };

    const clearAllFavorites = async () => {
        Alert.alert(
            "Clear All Favorites",
            "Are you sure you want to remove all favorite universities?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
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

        // Update the local profile state to reflect the change
        const newTheme = !isDarkMode ? 'dark' : 'light';
        const updatedProfile = {
            ...userProfile,
            themePreference: newTheme,
            lastUpdated: new Date().toISOString()
        };
        setUserProfile(updatedProfile);
    };

    const viewProfile = async () => {
        try {
            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
            const profileContent = await FileSystem.readAsStringAsync(profileFile);
            Alert.alert('User Profile', profileContent || 'No profile found');
        } catch (error) {
            Alert.alert('Error', 'Could not read profile file');
        }
    };

    const resetProfile = async () => {
        Alert.alert(
            "Reset Profile",
            "Are you sure you want to reset your profile? This will clear your theme preference and favorite count.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const profileFile = FileSystem.documentDirectory + 'user_profile.json';
                            await FileSystem.deleteAsync(profileFile, { idempotent: true });

                            const defaultProfile = {
                                themePreference: 'light',
                                lastUpdated: new Date().toISOString(),
                                favoriteCount: favoriteUniversities.length
                            };
                            setUserProfile(defaultProfile);
                            await saveUserProfile(defaultProfile);
                            Alert.alert('Success', 'Profile reset successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Could not reset profile');
                        }
                    }
                }
            ]
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.background }}>
            {/* <SafeAreaView style={styles.safeArea}> */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Theme Selection Card */}
                <Card style={[styles.card, { backgroundColor: theme.surface }]}>
                    <CardContent>
                        <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                            <Ionicons name="color-palette-outline" size={20} color={theme.primary} style={styles.iconMargin} />
                            Theme Settings
                        </CardTitle>
                        <Button
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
                                Favorite Universities ({favoriteUniversities.length})
                            </CardTitle>
                            {favoriteUniversities.length > 0 && (
                                <TouchableOpacity onPress={clearAllFavorites}>
                                    <Text style={[styles.clearText, { color: theme.primary }]}>Clear All</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {favoriteUniversities.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="heart-dislike-outline" size={48} color={theme.textSecondary} />
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                    No favorite universities yet
                                </Text>
                                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                                    Favorite universities will appear here
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
                                                        {university.country || 'Unknown Country'}
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
                            User Profile
                        </CardTitle>
                        <Text style={[styles.profileDescription, { color: theme.textSecondary }]}>
                            Your preferences and settings are automatically saved to a profile file
                        </Text>

                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileItem, { color: theme.text }]}>
                                Theme Preference: <Text style={{ color: theme.primary }}>{userProfile.themePreference}</Text>
                            </Text>
                            <Text style={[styles.profileItem, { color: theme.text }]}>
                                Favorite Universities: <Text style={{ color: theme.primary }}>{userProfile.favoriteCount}</Text>
                            </Text>
                            {userProfile.lastUpdated && (
                                <Text style={[styles.profileItem, { color: theme.textSecondary }]}>
                                    Last Updated: {new Date(userProfile.lastUpdated).toLocaleDateString()}
                                </Text>
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <Button
                                title="View Profile"
                                onPress={viewProfile}
                                variant="outline"
                                textStyle={{ color: theme.text }}
                                style={[styles.profileButton, { marginRight: 8, backgroundColor: theme.surfaceSecondary }]}
                            />
                            <Button
                                title="Reset Profile"
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
            {/* </SafeAreaView> */}
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
