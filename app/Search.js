import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { searchUniversities, getRankingOptions, getCountries, getCities } from '../lib/api';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);

    // --- State for DropDownPicker Components ---
    const [countryOpen, setCountryOpen] = useState(false);
    const [country, setCountry] = useState(null);
    const [countryItems, setCountryItems] = useState([]);

    const [sortOpen, setSortOpen] = useState(false);
    const [sortCredit, setSortCredit] = useState(null);
    const [rankingItems, setRankingItems] = useState([]);

    // --- State for Data and Results ---
    const [results, setResults] = useState([]);
    const [allCountries, setAllCountries] = useState([]);
    const [rankingOptions, setRankingOptions] = useState([]);

    // --- Data Fetching Logic ---

    // Main data fetch, runs when any filter changes
    useEffect(() => {
        fetchData();
    }, [query, country, sortCredit]);




    // General function to fetch university results based on all filters
    const fetchData = async () => {
        const data = await searchUniversities({ query, country, sort_credit: sortCredit });
        const cleaned = data.map(u => ({
            ...u,
            country: u.country || 'N/A',
            city: u.city || 'N/A'
        }));
        setResults(cleaned);
    };

    // Fetch initial options for country and ranking pickers on component mount
    useEffect(() => {
        (async () => {
            // Use array of strings for rankingOptions, as expected by setRankingItems below
            setRankingOptions([
                'US_News_best global universities_Rankings',
                'QS_World_University_Rankings'
            ]);

            const countryOpts = await getCountries();
            setAllCountries(countryOpts);
            setSortCredit('US_News_best global universities_Rankings')
        })();
    }, []);

    // --- Format data for the other DropDownPicker components ---
    useEffect(() => {
        setCountryItems([
            { label: 'All Countries', value: null },
            ...allCountries.map(c => ({ label: c, value: c }))
        ]);
    }, [allCountries]);

    useEffect(() => {
        setRankingItems(rankingOptions.map(opt => ({ label: opt, value: opt })));
    }, [rankingOptions]);

    useEffect(() => { if (countryOpen) { setSortOpen(false); setSearchOpen(false); } }, [countryOpen]);

    useEffect(() => { if (sortOpen) { setCountryOpen(false); setSearchOpen(false); } }, [sortOpen]);

    useEffect(() => { if (searchOpen) { setCountryOpen(false); setSortOpen(false); } }, [searchOpen]);

    return (
        <SafeAreaView style={{ flex: 1 }} >
            <View style={styles.container}>
                <TextInput
                    open={searchOpen}
                    style={styles.input}
                    placeholder="Search University Here..."
                    value={query}
                    onChangeText={setQuery}
                />

                <View style={[styles.pickerRow, { zIndex: 3000 }]}>
                    <DropDownPicker
                        open={countryOpen}
                        value={country}
                        items={countryItems}
                        setOpen={setCountryOpen}
                        setValue={setCountry}
                        setItems={setCountryItems}
                        placeholder="All Countries"
                        style={styles.picker}
                        containerStyle={styles.pickerContainer}
                        listMode="SCROLLVIEW"
                        searchable={true}
                    />
                </View>

                <View style={{ zIndex: 2000 }}>
                    <DropDownPicker
                        open={sortOpen}
                        value={sortCredit}
                        items={rankingItems}
                        setOpen={setSortOpen}
                        setValue={setSortCredit}
                        setItems={setRankingItems}
                        placeholder="Sort by"
                        style={styles.picker}
                        containerStyle={{ marginTop: 10 }}
                        listMode="SCROLLVIEW"
                    />
                </View>

                <FlatList
                    style={{ marginTop: 1 }}
                    data={results}
                    keyExtractor={(item, index) => `${item.normalized_name}-${index}`}
                    renderItem={({ item, index }) => (
                        <Pressable
                            onPress={() => navigation.navigate('DetailPage', { normalized_name: item.normalized_name, name: item.name })}
                        >
                            <View style={styles.card}>
                                <View style={{ marginRight: 10, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 24, fontWeight: 'bold' }}> #{index + 1}</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
                                    <Text style={{ fontSize: 14, color: '#555' }}>{item.city}, {item.country}</Text>
                                </View>
                            </View>
                        </Pressable>
                    )}
                    ListHeaderComponent={<View />}
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
    },
    pickerContainer: {
        flex: 1,
        marginHorizontal: 2,
    },
    picker: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#d2d2d2ff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        marginTop: 10
    }
});