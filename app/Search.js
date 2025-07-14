import React, { use, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { searchUniversities, getRankingOptions } from '../lib/api';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';


export default function SearchScreen() {
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const [country, setCountry] = useState(null);
    const [city, setCity] = useState(null);
    const [sortCredit, setSortCredit] = useState(null);
    const [results, setResults] = useState([]);
    const [allCountries, setAllCountries] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [rankingOptions, setRankingOptions] = useState([]);

    useEffect(() => {
        fetchInitialOptions();
    }, []);

    useEffect(() => {
        fetchCitiesOptions();
    }, [country]);

    useEffect(() => {
        fetchData();
    }, [query, country, city, sortCredit]);

    const fetchInitialOptions = async () => {
        const data = await searchUniversities({ query, country, city, sort_credit: sortCredit });
        const cleaned = data.map(u => ({
            ...u,
            country: u.country || 'N/A',
            city: u.city || 'N/A'
        }));
        setResults(cleaned);
        const countries = [...new Set(cleaned.map(u => u.country))].filter(u => u != 'N/A').sort();
        const cities = [...new Set(cleaned.map(u => u.city))].filter(c => c != 'N/A').sort();
        setAllCountries(countries);
        setAllCities(cities);

    }

    const fetchCitiesOptions = async () => {
        const data = await searchUniversities({
            query, country, city: '', sort_credit: sortCredit
        });
        const cleaned = data.map(u => ({
            ...u,
            country: u.country || 'N/A',
            city: u.city || 'N/A'
        }));
        const cities = [...new Set(cleaned.map(u => u.city))].filter(c => c != 'N/A').sort();
        setAllCities(cities);
    }

    const fetchData = async () => {
        const data = await searchUniversities({ query, country, city, sort_credit: sortCredit });
        const cleaned = data.map(u => ({
            ...u,
            country: u.country || 'N/A',
            city: u.city || 'N/A'
        }));
        setResults(cleaned);
    };

    useEffect(() => {
        (async () => {
            const options = await getRankingOptions();
            setRankingOptions(options);
        })();
    }, []);



    return (
        <SafeAreaView style={{ flex: 1 }} >
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Search University..."
                    value={query}
                    onChangeText={setQuery}
                />

                <View style={styles.pickerRow}>
                    <Picker
                        style={styles.picker}
                        selectedValue={country}
                        onValueChange={(value) => setCountry(value)}>
                        <Picker.Item label="All Countries" value={''} />
                        {allCountries.map(c => <Picker.Item key={c} label={c} value={c} />)}
                    </Picker>

                    <Picker
                        style={styles.picker}
                        selectedValue={city}
                        onValueChange={(value) => setCity(value)}>
                        <Picker.Item label="All Cities" value={''} />
                        {allCities.map(c => <Picker.Item key={c} label={c} value={c} />)}
                    </Picker>
                </View>

                <Picker
                    style={styles.picker}
                    selectedValue={sortCredit}
                    onValueChange={(value) => setSortCredit(value)}>
                    <Picker.Item label="Alphabet " value={''} />
                    {rankingOptions.map(opt => (
                        <Picker.Item key={opt} label={opt} value={opt} />
                    ))}
                </Picker>

                <FlatList
                    data={results}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => navigation.navigate('DetailPage', { props: item.normalized_name })}
                        >
                            <View style={styles.card}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.sub}>{item.city}, {item.country}</Text>
                            </View>
                        </Pressable>)}
                />
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: 'white'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10
    },
    pickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    picker: {
        flex: 1,
        marginHorizontal: 5
    },
    card: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    sub: {
        fontSize: 14,
        color: '#555'
    }
});
