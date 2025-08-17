import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image } from 'react-native';
import { getUniversityRankingsBySource } from '../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UniversitySourceRankingsPage({ route }) {
    // Expect route.params: { normalizedName, universityName, source }
    const { normalizedName, universityName, source } = route.params;
    const [loading, setLoading] = useState(true);
    const [rankingData, setRankingData] = useState(null);

    useEffect(() => {
        async function fetchRankings() {
            setLoading(true);
            const data = await getUniversityRankingsBySource(normalizedName, source);
            setRankingData(data);
            setLoading(false);
        }
        fetchRankings();
    }, [normalizedName, source]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Loading rankings...</Text>
            </View>
        );
    }

    if (!rankingData || rankingData.error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>No rankings found for this source.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>{universityName}</Text>
                <Text style={styles.subtitle}>{source} Rankings</Text>
            </View>

            <FlatList
                data={rankingData.rankings}
                keyExtractor={(item, idx) => `${item.subject}-${idx}`}
                renderItem={({ item }) => (
                    <View style={styles.rankingCard}>
                        <Text style={styles.subjectText}>{item.subject}</Text>
                        <Text style={styles.rankText}>#{item.rank_value}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No rankings available for {source}</Text>
                    </View>
                }
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6c757d',
    },
    errorText: {
        fontSize: 18,
        color: '#dc3545',
        textAlign: 'center',
        paddingHorizontal: 20
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        paddingHorizontal: 20
    },
    headerContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 18,
        color: '#4a90e2',
        fontWeight: '600',
        marginBottom: 16
    },
    universityImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#f1f3f4'
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20
    },
    rankingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#4a90e2'
    },
    subjectText: {
        fontSize: 16,
        color: '#2c3e50',
        fontWeight: '500',
        flex: 1
    },
    rankText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4a90e2'
    }
});
