import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { getRankingDetail } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Card, CardContent, CardTitle, CardSubtitle } from '../components/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatSourceName, formatSubjectName } from '../utils/textFormatter';
import i18n from '../lib/i18n';

export default function RankingDetailPage({ route }) {
    // Expect route.params: { table, source, subject }
    const { table, source, subject } = route.params;
    const [loading, setLoading] = useState(true);
    const [rankingDetail, setRankingDetail] = useState([]);
    const navigation = useNavigation();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { currentLanguage } = useLanguage();

    useEffect(() => {
        async function fetchDetail() {
            setLoading(true);
            const detail = await getRankingDetail({ table, source, subject });
            setRankingDetail(detail);
            setLoading(false);
        }
        // console.log("Fetching ranking detail for:", { table, source, subject });
        fetchDetail();
    }, [table, source, subject]);

    if (loading) {
        return (
            <GestureHandlerRootView style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{i18n.t('loading_ranking_details')}</Text>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>{formatSourceName(source)} - {formatSubjectName(subject)} {i18n.t('rankings')}</Text>
            <FlatList
                data={rankingDetail}
                keyExtractor={(item, idx) => `${item.normalized_name}-${idx}`}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('DetailPage', { normalized_name: item.normalized_name, name: item.name })}
                        activeOpacity={0.8}
                    >
                        <Card style={[styles.card, { backgroundColor: theme.surface }]}>
                            <CardContent style={styles.cardContent}>
                                <View style={[styles.rankContainer, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.rank}>{i18n.t('rank_prefix')}{item.rank_value}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <CardTitle style={[styles.name, { color: theme.text }]}>
                                        {item.name || item.normalized_name}
                                    </CardTitle>
                                    {item.country && (
                                        <CardSubtitle style={[styles.country, { color: theme.textSecondary }]}>
                                            {item.country}
                                        </CardSubtitle>
                                    )}
                                </View>
                            </CardContent>
                        </Card>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
            />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 30,
    },
    card: {
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
    name: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 4,
        lineHeight: 20,
    },
    country: {
        fontSize: 14,
        lineHeight: 18,
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
