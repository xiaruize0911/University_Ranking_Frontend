import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getUniversityRankingsBySource } from '../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardTitle, CardSubtitle } from '../components/Card';
import { formatSourceName, formatSubjectName } from '../utils/textFormatter';

export default function UniversitySourceRankingsPage({ route }) {
    // Expect route.params: { normalizedName, universityName, source }
    const { normalizedName, universityName, source } = route.params;
    const [loading, setLoading] = useState(true);
    const [rankingData, setRankingData] = useState(null);
    const navigation = useNavigation();
    const { theme, isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        async function fetchRankings() {
            setLoading(true);
            const data = await getUniversityRankingsBySource(normalizedName, source);
            setRankingData(data);
            setLoading(false);
        }
        fetchRankings();
    }, [normalizedName, source]);

    const renderHeader = () => (
        <Card style={[styles.headerCard, { backgroundColor: theme.surface }]}>
            <CardContent>
                <CardTitle style={[styles.title, { color: theme.text }]}>{universityName}</CardTitle>
                <CardSubtitle style={[styles.subtitle, { color: theme.primary }]}>
                    {formatSourceName(source)} Rankings
                </CardSubtitle>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <GestureHandlerRootView style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading rankings...</Text>
            </GestureHandlerRootView>
        );
    }

    if (!rankingData || rankingData.error) {
        return (
            <GestureHandlerRootView style={[styles.center, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.text }]}>No rankings found for this source.</Text>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={rankingData.rankings}
                    keyExtractor={(item, idx) => `${item.subject}-${idx}`}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <Card style={[styles.rankingCard, { backgroundColor: theme.surface }]}>
                            <CardContent style={styles.cardContent}>
                                <View style={[styles.rankContainer, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.rank}>#{item.rank_value}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <CardTitle style={[styles.subjectText, { color: theme.text }]}>
                                        {formatSubjectName(item.subject)}
                                    </CardTitle>
                                </View>
                            </CardContent>
                        </Card>
                    )}
                    ListEmptyComponent={
                        <Card style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
                            <CardContent>
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                    No rankings available for {formatSourceName(source)}
                                </Text>
                            </CardContent>
                        </Card>
                    }
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />

                {/* Floating Theme Toggle Button */}
                <TouchableOpacity
                    style={[
                        styles.floatingThemeButton,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border
                        }
                    ]}
                    onPress={toggleTheme}
                    activeOpacity={0.8}
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
        paddingHorizontal: 20
    },
    headerCard: {
        margin: 16,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 100
    },
    rankingCard: {
        marginBottom: 12,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankContainer: {
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 16,
        minWidth: 50,
        alignItems: 'center',
    },
    rank: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#ffffff'
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    subjectText: {
        fontSize: 16,
        fontWeight: '500',
    },
    emptyCard: {
        marginTop: 32,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
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