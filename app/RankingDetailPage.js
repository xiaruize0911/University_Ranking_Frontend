import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { getRankingDetail } from '../lib/api';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function RankingDetailPage({ route }) {
    // Expect route.params: { table, source, subject }
    const { table, source, subject } = route.params;
    const [loading, setLoading] = useState(true);
    const [rankingDetail, setRankingDetail] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        async function fetchDetail() {
            setLoading(true);
            const detail = await getRankingDetail({ table, source, subject });
            setRankingDetail(detail);
            setLoading(false);
        }
        console.log("Fetching ranking detail for:", { table, source, subject });
        fetchDetail();
    }, [table, source, subject]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Loading ranking details...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{source} - {subject} Rankings</Text>
            <FlatList
                data={rankingDetail}
                keyExtractor={(item, idx) => `${item.normalized_name}-${idx}`}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('DetailPage', { normalized_name: item.normalized_name, name: item.name })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.card}>
                            <View style={styles.rankContainer}>
                                <Text style={styles.rank}>#{item.rank_value}</Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.name}>{item.name || item.normalized_name}</Text>
                                {item.country && (
                                    <Text style={styles.country}>{item.country}</Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6c757d',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#2c3e50',
        lineHeight: 30,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
    },
    rankContainer: {
        backgroundColor: '#4a90e2',
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
        color: '#2c3e50',
        marginBottom: 4,
        lineHeight: 20,
    },
    country: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 18,
    },
    blurb: {
        fontSize: 13,
        color: '#888',
        marginTop: 4
    }
});
