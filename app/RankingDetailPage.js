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
                <ActivityIndicator size="large" />
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
                    >
                        <View style={styles.card}>
                            <Text style={styles.rank}>#{item.rank_value}</Text>
                            <Text style={styles.name}>{item.name || item.normalized_name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    card: {
        backgroundColor: '#e6f7ff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        marginTop: 10
    },
    rank: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#0077b6',
        marginBottom: 4
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#222',
        marginBottom: 2
    },
    country: {
        fontSize: 14,
        color: '#555',
        marginBottom: 2
    },
    blurb: {
        fontSize: 13,
        color: '#888',
        marginTop: 4
    }
});
