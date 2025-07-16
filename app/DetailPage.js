import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '../constants/config';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GetUniversityDetail(props) {
    console.log("props: ", props);
    const normalized_name = props.route.params.normalized_name;
    console.log("normalized_name: ", normalized_name);
    const [university, setUniversity] = useState(null);
    const [loading, setLoading] = useState(true);

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
            <ScrollView contentContainerStyle={styles.container}>
                {university.photo && (
                    <Image source={{ uri: university.photo }} style={styles.image} />
                )}
                <Text style={styles.name}>{university.name}</Text>
                <Text style={styles.location}>{university.city}, {university.country}</Text>
                <Text style={styles.description}>{university.blurb}</Text>
                {/* Optionally show more fields if needed */}
                <Text style={styles.rankings}>Rankings:</Text>
                <View style={styles.rankingsContainer}>
                    {university.rankings.map((item, idx) => (
                        <Text key={`${item.source}_${item.subject}_${idx}`} style={styles.rankings}>
                            {item.source} {item.subject}: {item.rank_value}
                        </Text>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        paddingHorizontal: 20,
        paddingBottom: 100
    },
    rankingsContainer: {
        flexGrow: 50,
        paddingBottom: 120,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 8,
        textAlign: 'center'
    },
    location: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center'
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'justify'
    },
    image: {
        height: '20%',
        alignItems: 'stretch'
    },
    rankings: {
        fontSize: 12,
        flexGrow: 100,
        fontWeight: 'bold',
        marginVertical: 0,
        textAlign: 'left'
    }
});