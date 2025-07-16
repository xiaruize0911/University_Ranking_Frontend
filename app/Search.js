import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { searchUniversities, getRankingOptions, getCountries, getCities } from '../lib/api';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
    const navigation = useNavigation();
    const [query, setQuery] = useState('');

    // --- State for DropDownPicker Components ---
    const [countryOpen, setCountryOpen] = useState(false);
    const [country, setCountry] = useState(null);
    const [countryItems, setCountryItems] = useState([]);

    const [cityOpen, setCityOpen] = useState(false);
    const [city, setCity] = useState(null);
    const [cityItems, setCityItems] = useState([]);

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
    }, [query, country, city, sortCredit]);

    // **REFACTORED:** This now directly fetches and sets `cityItems` when the country changes.
    useEffect(() => {
        const fetchCityItems = async () => {
            const cityOptions = await getCities(country); // Fetch raw city strings
            // console.log('Fetching city items...', country, cityOptions);
            // Format the raw strings into {label, value} objects and set them for the picker
            setCityItems((cityOptions || []).map(c => ({ label: c, value: c })));

            // Reset the selected city
            setCity(null);
        };

        fetchCityItems();
    }, [country]);


    // General function to fetch university results based on all filters
    const fetchData = async () => {
        const data = await searchUniversities({ query, country, city, sort_credit: sortCredit });
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
            const rankOpts = await getRankingOptions();
            setRankingOptions(rankOpts);

            const countryOpts = await getCountries();
            setAllCountries(countryOpts);
        })();
    }, []);

    // --- Format data for the other DropDownPicker components ---
    useEffect(() => {
        setCountryItems(allCountries.map(c => ({ label: c, value: c })));
    }, [allCountries]);

    useEffect(() => {
        setRankingItems(rankingOptions.map(opt => ({ label: opt, value: opt })));
    }, [rankingOptions]);

    return (
        <SafeAreaView style={{ flex: 1 }} >
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Search University..."
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
                    />
                    <DropDownPicker
                        open={cityOpen}
                        value={city}
                        items={cityItems}
                        setOpen={setCityOpen}
                        setValue={setCity}
                        setItems={setCityItems}
                        placeholder="All Cities"
                        style={styles.picker}
                        containerStyle={styles.pickerContainer}
                        listMode="SCROLLVIEW"
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
                        placeholder="Alphabet Order"
                        style={styles.picker}
                        containerStyle={{ marginTop: 10 }}
                        listMode="SCROLLVIEW"
                    />
                </View>

                <FlatList
                    data={results}
                    keyExtractor={(item, index) => `${item.normalized_name}-${index}`}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Pressable
                                onPress={() => navigation.navigate('DetailPage', { normalized_name: item.normalized_name })}
                            >
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.sub}>{item.city}, {item.country}</Text>
                            </Pressable>
                        </View>
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
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        marginTop: 10
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