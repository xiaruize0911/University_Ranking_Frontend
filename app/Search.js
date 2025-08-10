import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { searchUniversities, getCountries } from '../lib/api';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const [country, setCountry] = useState(null);
    const [sortCredit, setSortCredit] = useState(null);
    const [countrySearchQuery, setCountrySearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [allCountries, setAllCountries] = useState([]);
    const [rankingOptions, setRankingOptions] = useState([]);

    const countrySheetRef = useRef(null);
    const rankingSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['25%', '50%'], []);

    // --- Data Fetching Logic ---
    useEffect(() => {
        fetchData();
    }, [query, country, sortCredit]);

    const fetchData = async () => {
        const data = await searchUniversities({ query, country, sort_credit: sortCredit });
        const cleaned = data.map(u => ({
            ...u,
            country: u.country || 'N/A',
            city: u.city || 'N/A'
        }));
        setResults(cleaned);
    };

    useEffect(() => {
        (async () => {
            setRankingOptions([
                { label: 'US News Best Global Universities', value: 'US_News_best global universities_Rankings' },
                { label: 'QS World University Rankings', value: 'QS_World_University_Rankings' }
            ]);

            const countryOpts = await getCountries();
            setAllCountries(countryOpts);
            setSortCredit('US_News_best global universities_Rankings')
        })();
    }, []);

    const countryItems = useMemo(() => [
        { label: 'All Countries', value: null },
        ...allCountries.map(c => ({ label: c, value: c }))
    ], [allCountries]);

    const filteredCountryItems = useMemo(() => {
        if (!countrySearchQuery) return countryItems;
        return countryItems.filter(item =>
            item.label.toLowerCase().includes(countrySearchQuery.toLowerCase())
        );
    }, [countryItems, countrySearchQuery]);

    const rankingItems = useMemo(() => rankingOptions.map(opt => ({ label: opt.label, value: opt.value })), [rankingOptions]);

    const handleCountryPress = useCallback(() => {
        setCountrySearchQuery(''); // Reset search when opening
        rankingSheetRef.current?.close(); // Close ranking sheet if open
        countrySheetRef.current?.expand();
    }, []);

    const handleRankingPress = useCallback(() => {
        countrySheetRef.current?.close(); // Close country sheet if open
        rankingSheetRef.current?.expand();
    }, []);

    // Find the label for the current sortCredit value
    const selectedRankingLabel = useMemo(() => {
        const found = rankingItems.find(item => item.value === sortCredit);
        return found ? found.label : 'Sort by';
    }, [rankingItems, sortCredit]);

    const renderUniversityCard = ({ item, index }) => (
        <TouchableOpacity
            style={styles.universityCard}
            onPress={() => navigation.navigate('DetailPage', {
                normalized_name: item.normalized_name,
                name: item.name
            })}
        >
            <View style={styles.cardRow}>
                <View style={styles.rankContainer}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>{item.city}, {item.country}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search University Here..."
                        value={query}
                        onChangeText={setQuery}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleCountryPress}
                    >
                        <Text style={styles.buttonText}>{country || 'All Countries'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRankingPress}
                    >
                        <Text style={styles.buttonText}>{selectedRankingLabel}</Text>
                    </TouchableOpacity>

                    <FlatList
                        style={styles.resultsList}
                        data={results}
                        keyExtractor={(item, index) => `${item.normalized_name}-${index}`}
                        renderItem={renderUniversityCard}
                        ListHeaderComponent={<View />}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                <BottomSheet
                    ref={countrySheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    enablePanDownToClose={true}
                >
                    <BottomSheetScrollView style={styles.sheetContainer}>
                        <Text style={styles.sheetTitle}>Select Country</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Search countries..."
                            value={countrySearchQuery}
                            onChangeText={setCountrySearchQuery}
                        />
                        {filteredCountryItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.value || `key-${index}`}
                                style={styles.sheetItem}
                                onPress={() => {
                                    setCountry(item.value);
                                    setCountrySearchQuery('');
                                    countrySheetRef.current?.close();
                                }}
                            >
                                <Text style={styles.sheetItemText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </BottomSheetScrollView>
                </BottomSheet>

                <BottomSheet
                    ref={rankingSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    enablePanDownToClose={true}
                >
                    <BottomSheetScrollView style={styles.sheetContainer}>
                        <Text style={styles.sheetTitle}>Select Ranking</Text>
                        {rankingItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.value || `key-${index}`}
                                style={styles.sheetItem}
                                onPress={() => {
                                    setSortCredit(item.value);
                                    rankingSheetRef.current?.close();
                                }}
                            >
                                <Text style={styles.sheetItemText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </BottomSheetScrollView>
                </BottomSheet>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    input: {
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#ffffff',
        fontSize: 16,
    },
    button: {
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        marginBottom: 10,
    },
    buttonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '400',
    },
    resultsList: {
        marginTop: 8,
    },
    universityCard: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    rankContainer: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        minWidth: 70,
    },
    rankText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4a90e2'
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    sheetContainer: {
        flex: 1,
        padding: 16,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    sheetItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e5e9',
    },
    sheetItemText: {
        fontSize: 16,
        color: '#333',
    },
});