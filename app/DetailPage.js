import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from '../constants/config';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardTitle, CardSubtitle } from '../components/Card';
import { formatSourceName, formatStatsType } from '../utils/textFormatter';

export default function GetUniversityDetail(props) {
    // console.log("props: ", props);
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const normalized_name = props.route.params.normalized_name;
    // console.log("normalized_name: ", normalized_name);
    const [university, setUniversity] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    console.log("Fetching details for normalized_name: ", normalized_name);

    useEffect(() => {
        if (normalized_name) {
            fetch(`${API_BASE_URL}/universities/${normalized_name}`)
                .then(res => res.json())
                .then(data => {
                    setUniversity(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching details:', err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [normalized_name]); // Add normalized_name as a dependency

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading university details...</Text>
            </View>
        );
    }

    if (!university) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.text }]}>No details found.</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
                <ScrollView style={[styles.scrollContainer, { backgroundColor: theme.background }]}>
                    <Card style={[styles.headerCard, { backgroundColor: theme.surface }]}>
                        <View style={styles.headerRow}>
                            <Image
                                source={{ uri: university.photo }}
                                style={styles.headerImageInline}
                                resizeMode="contain"
                            />
                            <CardContent style={styles.headerTextContainer}>
                                <CardTitle style={{ color: theme.text }}>{university.name}</CardTitle>
                                <CardSubtitle style={{ color: theme.textSecondary }}>
                                    {university.city + ', \n' + university.country}
                                </CardSubtitle>
                            </CardContent>
                        </View>
                    </Card>

                    {/*Blurb block*/}
                    {university.blurb ? (
                        <Card style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                            <CardContent>
                                <CardTitle style={{ color: theme.text }}>About</CardTitle>
                                <Text style={[styles.blurbText, { color: theme.text }]}>{university.blurb}</Text>
                            </CardContent>
                        </Card>
                    ) : null}
                    { /* Stats block */}
                    {university.stats && university.stats.length > 0 && (
                        <Card style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                            <CardContent>
                                <CardTitle style={{ color: theme.text }}>Statistics</CardTitle>
                                <View style={styles.statsGrid}>
                                    {university.stats.map((item, idx) => (
                                        <View style={[styles.statsBlock, { backgroundColor: theme.surfaceSecondary, borderLeftColor: theme.primary }]} key={item.key || idx}>
                                            <Text style={[styles.statsType, { color: theme.textSecondary }]}>{formatStatsType(item.type)}</Text>
                                            <Text style={[styles.statsCount, { color: theme.primary }]}>{item.count || 'N/A'}</Text>
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
                                <CardTitle style={{ color: theme.text }}>Subject Rankings by Source</CardTitle>
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
                                                    {item.count} ranking{item.count !== 1 ? 's' : ''}
                                                </Text>
                                            </View>
                                            <Text style={[styles.arrowText, { color: theme.primary }]}>→</Text>
                                        </TouchableOpacity>
                                    )}
                                    scrollEnabled={false}
                                />
                            </CardContent>
                        </Card>
                    )}
                    <View style={{ height: 20 }} />
                </ScrollView>
                {/* Floating Theme Toggle Button */}
                <TouchableOpacity
                    style={[styles.floatingThemeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={toggleTheme}
                >
                    <Text style={[styles.themeButtonText, { color: theme.text }]}>
                        {isDarkMode ? '☀️' : '🌙'}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
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
    sectionCard: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    blurbText: {
        fontSize: 16,
        lineHeight: 24,
        marginTop: 12,
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