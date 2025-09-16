import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardTitle, CardSubtitle } from '../components/Card';
import { formatSourceName, formatStatsType } from '../utils/textFormatter';
import { getUniversityName } from '../lib/universityNameTranslations';
import Ionicons from '@expo/vector-icons/Ionicons';
import i18n from '../lib/i18n';
import { getUniversityDetails, translateText } from '../lib/api';

export default function GetUniversityDetail(props) {
    // console.log("props: ", props);
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { isChinese } = useLanguage();
    const normalized_name = props.route.params.normalized_name;
    // console.log("normalized_name: ", normalized_name);
    const [university, setUniversity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [translatedBlurb, setTranslatedBlurb] = useState('');
    const [translationLoading, setTranslationLoading] = useState(false);
    const navigation = useNavigation();
    const { currentLanguage } = useLanguage();

    console.log("Fetching details for normalized_name: ", normalized_name);

    useEffect(() => {
        if (normalized_name) {
            getUniversityDetails(normalized_name)
                .then(data => {
                    if (data.notFound) {
                        // Handle not found case
                        navigation.goBack();
                        console.warn(i18n.t('university_not_found') + ':', normalized_name);
                    } else {
                        setUniversity(data);
                        setLoading(false);
                        checkIfFavorite(data);
                    }
                })
                .catch(err => {
                    console.error(i18n.t('error_fetching_details') + ':', err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [normalized_name]); // Add normalized_name as a dependency

    // Translate blurb when university data is loaded and language is Chinese
    useEffect(() => {
        let isMounted = true;

        const translateBlurbIfNeeded = async () => {
            if (university && university.blurb && isChinese) {
                setTranslationLoading(true);
                try {
                    const translated = await translateText(university.blurb, 'en', 'zh-Hans');
                    if (isMounted) {
                        setTranslatedBlurb(translated);
                    }
                } catch (error) {
                    console.error('Translation failed:', error);
                    if (isMounted) {
                        setTranslatedBlurb(''); // Clear translated text on error
                    }
                } finally {
                    if (isMounted) {
                        setTranslationLoading(false);
                    }
                }
            } else if (!isChinese) {
                // Clear translated text when switching back to English
                if (isMounted) {
                    setTranslatedBlurb('');
                }
            }
        };

        translateBlurbIfNeeded();

        return () => {
            isMounted = false;
        };
    }, [university, isChinese]); // Re-run when university or language changes

    // Check if current university is in favorites
    const checkIfFavorite = async (universityData) => {
        try {
            const stored = await AsyncStorage.getItem('favoriteUniversities');
            if (stored) {
                const favorites = JSON.parse(stored);
                const isCurrentFavorite = favorites.some(fav =>
                    fav.normalized_name === universityData.normalized_name ||
                    fav.id === universityData.id
                );
                setIsFavorite(isCurrentFavorite);
            }
        } catch (error) {
            console.error(i18n.t('error_checking_favorites') + ':', error);
        }
    };

    // Toggle favorite status
    const toggleFavorite = async () => {
        if (!university) return;

        setFavoriteLoading(true);
        try {
            const stored = await AsyncStorage.getItem('favoriteUniversities');
            let favorites = stored ? JSON.parse(stored) : [];

            const favoriteData = {
                id: university.id || university.normalized_name,
                normalized_name: university.normalized_name,
                name: university.name,
                country: university.country,
                city: university.city,
                photo: university.photo
            };

            if (isFavorite) {
                // Remove from favorites
                favorites = favorites.filter(fav =>
                    fav.normalized_name !== university.normalized_name &&
                    fav.id !== university.id
                );
                setIsFavorite(false);
            } else {
                // Add to favorites
                favorites.push(favoriteData);
                setIsFavorite(true);
            }

            await AsyncStorage.setItem('favoriteUniversities', JSON.stringify(favorites));
        } catch (error) {
            console.error(i18n.t('error_updating_favorites') + ':', error);
        } finally {
            setFavoriteLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{i18n.t('loading_university_details')}</Text>
            </View>
        );
    }

    if (!university) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={[styles.scrollContainer, { backgroundColor: theme.background }]}>
                <Card style={[styles.headerCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.headerRow}>
                        <Image
                            source={{ uri: university.photo }}
                            style={styles.headerImageInline}
                            resizeMode="contain"
                        />
                        <CardContent style={styles.headerTextContainer}>
                            <CardTitle style={{ color: theme.text }}>{getUniversityName(university.normalized_name, currentLanguage)}</CardTitle>
                            <CardSubtitle style={{ color: theme.textSecondary }}>
                                {(university.city || '') + ((university.city || university.country) ? ', \n' : '') + (university.country || '')}
                            </CardSubtitle>
                        </CardContent>
                        <TouchableOpacity
                            style={[styles.favoriteButton, { backgroundColor: theme.surfaceSecondary }]}
                            onPress={toggleFavorite}
                            disabled={favoriteLoading}
                            activeOpacity={0.7}
                        >
                            {favoriteLoading ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : (
                                <Ionicons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={28}
                                    color={isFavorite ? "#ff4757" : theme.primary}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </Card>

                {/*Blurb block*/}
                {university.blurb ? (
                    <Card style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                        <CardContent>
                            <CardTitle style={{ color: theme.text }}>{i18n.t('about')}</CardTitle>
                            <Text style={[styles.blurbText, { color: theme.text }]}>{university.blurb}</Text>

                            {/* Translated text block - only show when Chinese is selected */}
                            {isChinese && (
                                <View style={styles.translationContainer}>
                                    {translationLoading ? (
                                        <View style={styles.translationLoading}>
                                            <ActivityIndicator size="small" color={theme.primary} />
                                            <Text style={[styles.translationLabel, { color: theme.textSecondary }]}>
                                                {i18n.t('translating')}...
                                            </Text>
                                        </View>
                                    ) : translatedBlurb ? (
                                        <View style={styles.translatedBlock}>
                                            <Text style={[styles.translationLabel, { color: theme.textSecondary }]}>
                                                中文翻译:
                                            </Text>
                                            <Text style={[styles.translatedText, { color: theme.text }]}>
                                                {translatedBlurb}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            )}
                        </CardContent>
                    </Card>
                ) : null}
                { /* Stats block */}
                {university.stats && university.stats.length > 0 && (
                    <Card style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                        <CardContent>
                            <CardTitle style={{ color: theme.text }}>{i18n.t('statistics')}</CardTitle>
                            <View style={styles.statsGrid}>
                                {university.stats.map((item, idx) => (
                                    <View style={[styles.statsBlock, { backgroundColor: theme.surfaceSecondary, borderLeftColor: theme.primary }]} key={item.key || idx}>
                                        <Text style={[styles.statsType, { color: theme.textSecondary }]}>{formatStatsType(item.type)}</Text>
                                        <Text style={[styles.statsCount, { color: theme.primary }]}>{item.count || ''}</Text>
                                    </View>
                                ))}
                            </View>
                        </CardContent>
                    </Card>
                )}

                {/* Rankings block */}
                {university.rankings && university.rankings.length > 0 && (
                    <Card style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                        <CardContent>
                            <CardTitle style={{ color: theme.text }}>{i18n.t('subject_rankings_by_source')}</CardTitle>
                            <FlatList
                                data={(() => {
                                    // Group rankings by source
                                    const groupedRankings = {};
                                    university.rankings.forEach(ranking => {
                                        if (!groupedRankings[ranking.source]) {
                                            groupedRankings[ranking.source] = [];
                                        }
                                        groupedRankings[ranking.source].push(ranking);
                                    });
                                    // Convert to array with source names and count
                                    return Object.keys(groupedRankings).map(source => ({
                                        source,
                                        count: groupedRankings[source].length,
                                        rankings: groupedRankings[source]
                                    }));
                                })()}
                                keyExtractor={(item) => item.source}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.sourceRankingBlock, { backgroundColor: theme.surfaceSecondary, borderLeftColor: theme.primary }]}
                                        onPress={() => navigation.navigate('UniversitySourceRankingsPage', {
                                            normalizedName: university.normalized_name,
                                            universityName: university.name,
                                            source: item.source
                                        })}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.sourceRankingContent}>
                                            <Text style={[styles.sourceText, { color: theme.text }]}>{formatSourceName(item.source)}</Text>
                                            <Text style={[styles.rankingCountText, { color: theme.textSecondary }]}>
                                                {item.count} {item.count !== 1 ? i18n.t('rankings') : i18n.t('ranking')}
                                            </Text>
                                        </View>
                                        <Text style={[styles.arrowText, { color: theme.primary }]}>{i18n.t('arrow_right')}</Text>
                                    </TouchableOpacity>
                                )}
                                scrollEnabled={false}
                            />
                        </CardContent>
                    </Card>
                )}
                <View style={{ height: 20 }} />
            </ScrollView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        paddingHorizontal: 20,
        paddingBottom: 100
    },
    scrollContainer: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
    },
    headerCard: {
        margin: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerImageInline: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#f1f3f4',
        marginRight: 16
    },
    headerTextContainer: {
        flex: 1,
    },
    favoriteButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionCard: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    blurbText: {
        fontSize: 16,
        lineHeight: 24,
        marginTop: 12,
    },
    translationContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    translationLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    translationLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    translatedBlock: {
        marginTop: 8,
    },
    translatedText: {
        fontSize: 16,
        lineHeight: 24,
        fontStyle: 'italic',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 12,
    },
    statsBlock: {
        minWidth: 120,
        flexBasis: '45%',
        flexGrow: 1,
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
    },
    statsType: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    statsCount: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
    },
    sourceRankingBlock: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    sourceRankingContent: {
        flex: 1
    },
    sourceText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4
    },
    rankingCountText: {
        fontSize: 14,
    },
    arrowText: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    floatingThemeButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 1000,
    },
    themeButtonText: {
        fontSize: 24,
    },
});