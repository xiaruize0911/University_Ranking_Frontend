import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '../constants/config';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GetUniversityDetail(props) {
    // console.log("props: ", props);
    const normalized_name = props.route.params.normalized_name;
    // console.log("normalized_name: ", normalized_name);
    const [university, setUniversity] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log("Fetching details for university: ", university);

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
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Loading university details...</Text>
            </View>
        );
    }

    if (!university) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>No details found.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.headerRow}>
                    <Image
                        source={{ uri: university.photo }}
                        style={styles.headerImageInline}
                        resizeMode="contain"
                    />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerInline}>{university.name}</Text>
                        <Text style={styles.headerLocationInline}>{university.city + ', \n' + university.country}</Text>
                    </View>
                </View>
                {/*Blurb block*/}
                {university.blurb ? (
                    <View style={styles.blurbContainer}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.blurbText}>{university.blurb}</Text>
                    </View>
                ) : null}
                { /* Stats block */}
                {university.stats && university.stats.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Statistics</Text>
                        <View style={styles.statsGrid}>
                            {university.stats.map((item, idx) => (
                                <View style={styles.statsBlock} key={item.key || idx}>
                                    <Text style={styles.statsType}>{item.type}</Text>
                                    <Text style={styles.statsCount}>{item.count || 'N/A'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                {/* Rankings block */}
                {university.rankings && university.rankings.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Rankings</Text>
                        <View style={styles.rankingsGrid}>
                            {university.rankings.map((ranking, idx) => (
                                <View style={styles.rankingsBlock} key={idx}>
                                    <Text style={styles.rankingSource}>
                                        {ranking.source} {ranking.subject}
                                    </Text>
                                    <Text style={styles.rankingValue}>
                                        #{ranking.rank_value}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
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
        backgroundColor: '#f8f9fa'
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
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
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
    headerInline: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
        lineHeight: 28,
    },
    headerLocationInline: {
        fontSize: 16,
        color: '#6c757d',
        lineHeight: 20,
    },
    sectionContainer: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
    },
    blurbContainer: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 16,
        color: '#2c3e50'
    },
    blurbText: {
        fontSize: 16,
        color: '#495057',
        lineHeight: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12
    },
    statsBlock: {
        minWidth: 120,
        flexBasis: '45%',
        flexGrow: 1,
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#28a745'
    },
    statsType: {
        fontSize: 14,
        textAlign: 'center',
        color: '#6c757d',
        marginBottom: 8,
    },
    statsCount: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        color: '#28a745'
    },
    rankingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12
    },
    rankingsBlock: {
        minWidth: 120,
        flexBasis: '45%',
        flexGrow: 1,
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#4a90e2'
    },
    rankingSource: {
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
        color: '#6c757d',
        lineHeight: 18,
    },
    rankingValue: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#4a90e2',
        textAlign: 'center'
    }
});