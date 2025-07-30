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
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!university) {
        return (
            <View style={styles.center}>
                <Text>No details found.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView>
                <View style={styles.headerRow}>
                    <Image
                        source={{ uri: university.photo }}
                        style={styles.headerImageInline}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={styles.headerInline}>{university.name}</Text>
                        <Text style={styles.headerLocationInline}>{university.city + ', \n' + university.country}</Text>
                    </View>
                </View>
                {/*Blurb block*/}
                {university.blurb ? (
                    <View style={{ padding: 16, backgroundColor: '#f9f9f9', marginHorizontal: 20, marginBottom: 10, borderRadius: 8 }}>
                        <Text style={{ fontSize: 18, color: '#333' }}>{university.blurb}</Text>
                    </View>
                ) : null}
                { /* Stats block */}
                {university.stats && university.stats.length > 0 && (
                    <View style={{ backgroundColor: '#f9f9f9', marginHorizontal: 20, marginBottom: 10, borderRadius: 8, padding: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Statistics</Text>
                        <View style={styles.statsGrid}>
                            {university.stats.map((item, idx) => (
                                <View style={styles.statsBlock} key={item.key || idx}>
                                    <Text style={{ fontSize: 16, textAlign: 'center' }}>{item.type}</Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>{item.count || 'N/A'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                {/* Rankings block */}
                {university.rankings && university.rankings.length > 0 && (
                    <View style={{ backgroundColor: '#f9f9f9', marginHorizontal: 20, marginBottom: 10, borderRadius: 8, padding: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Rankings</Text>
                        <View style={styles.rankingsGrid}>
                            {university.rankings.map((ranking, idx) => (
                                <View style={styles.rankingsBlock} key={idx}>
                                    <Text style={{ fontSize: 16, marginBottom: 4, textAlign: 'center' }}>
                                        {ranking.source} {ranking.subject}
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>
                                        #{ranking.rank_value}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                <View>
                </View>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 200,
        paddingBottom: 10,
        marginHorizontal: 10,
        backgroundColor: '#f0f0f0'
    },
    headerImageInline: {
        width: 150,
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#eaeaea',
        marginRight: 16
    },
    headerInline: {
        fontSize: 22,
        fontWeight: 'bold',
        flexShrink: 1,
        flexWrap: 'wrap',
        color: '#222',
        maxWidth: 180,
    },
    headerLocationInline: {
        fontSize: 18,
        flexShrink: 1,
        flexWrap: 'wrap',
        color: '#222'
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        gap: 0
    },
    statsBlock: {
        minWidth: 120,
        flexBasis: '45%',
        flexGrow: 1,
        alignItems: 'center',
        fontSize: 18,
        margin: 5,
        padding: 10,
        backgroundColor: '#c5e472ff',
        borderRadius: 8
    },
    rankingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        gap: 0
    },
    rankingsBlock: {
        minWidth: 120,
        flexBasis: '45%',
        flexGrow: 1,
        alignItems: 'center',
        fontSize: 18,
        margin: 5,
        padding: 10,
        backgroundColor: '#72e0e4ff',
        borderRadius: 8
    }
});