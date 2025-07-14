import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '../constants/config';

export default function GetUniversityDetail(props) {
    // console.log("props: ", props);
    // Use props.route.params.props as in the original code, but we will fix this properly later
    const normalized_name = props.route.params.props;
    // console.log("normalized_name: ", normalized_name);
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
        <ScrollView contentContainerStyle={styles.container}>
            {university.photo && (
                <Image source={{ uri: university.photo }} style={styles.image} />
            )}
            <Text style={styles.name}>{university.name}</Text>
            <Text style={styles.location}>{university.city}, {university.country}</Text>
            <Text style={styles.description}>{university.blurb}</Text>
            {/* Optionally show more fields if needed */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: 'center'
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
        width: '100%',
        height: '100%',
        borderRadius: 10,
        marginBottom: 16
    }
});