import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { searchUniversities, getCountries } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

export default function SearchScreen() {
    const navigation = useNavigation();
    const { theme, isDarkMode, toggleTheme } = useTheme();
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
            style={[styles.universityCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('DetailPage', {
                normalized_name: item.normalized_name,
                name: item.name
            })}
        >
            <View style={styles.cardRow}>
                <View style={styles.rankContainer}>
                    <Text style={[styles.rankText, { color: theme.primary }]}>#{index + 1}</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{item.city}, {item.country}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={[{ flex: 1 }, { backgroundColor: theme.background }]}>
                <View style={[styles.container, { backgroundColor: theme.background }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
                        placeholder="Search University Here..."
                        placeholderTextColor={theme.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                    />

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={handleCountryPress}
                    >
                        <Text style={[styles.buttonText, { color: theme.text }]}>{country || 'All Countries'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={handleRankingPress}
                    >
                        <Text style={[styles.buttonText, { color: theme.text }]}>{selectedRankingLabel}</Text>
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
                    backgroundStyle={{ backgroundColor: theme.surface }}
                    handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
                >
                    <BottomSheetScrollView style={[styles.sheetContainer, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sheetTitle, { color: theme.text }]}>Select Country</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
                            placeholder="Search countries..."
                            placeholderTextColor={theme.textSecondary}
                            value={countrySearchQuery}
                            onChangeText={setCountrySearchQuery}
                        />
                        {filteredCountryItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.value || `key-${index}`}
                                style={[styles.sheetItem, { borderBottomColor: theme.border }]}
                                onPress={() => {
                                    setCountry(item.value);
                                    setCountrySearchQuery('');
                                    countrySheetRef.current?.close();
                                }}
                            >
                                <Text style={[styles.sheetItemText, { color: theme.text }]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </BottomSheetScrollView>
                </BottomSheet>

                <BottomSheet
                    ref={rankingSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    enablePanDownToClose={true}
                    backgroundStyle={{ backgroundColor: theme.surface }}
                    handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
                >
                    <BottomSheetScrollView style={[styles.sheetContainer, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sheetTitle, { color: theme.text }]}>Select Ranking</Text>
                        {rankingItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.value || `key-${index}`}
                                style={[styles.sheetItem, { borderBottomColor: theme.border }]}
                                onPress={() => {
                                    setSortCredit(item.value);
                                    rankingSheetRef.current?.close();
                                }}
                            >
                                <Text style={[styles.sheetItemText, { color: theme.text }]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </BottomSheetScrollView>
                </BottomSheet>

                {/* Floating Theme Toggle Button */}
                <TouchableOpacity
                    style={[styles.floatingThemeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={toggleTheme}
                >
                    <Text style={[styles.themeButtonText, { color: theme.text }]}>
                        {isDarkMode ? '☀️' : '🌙'}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    floatingThemeButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 1000,
    },
    themeButtonText: {
        fontSize: 24,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    button: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '400',
    },
    resultsList: {
        marginTop: 8,
    },
    universityCard: {
        borderWidth: 1,
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
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
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
    },
    sheetItem: {
        padding: 16,
        borderBottomWidth: 1,
    },
    sheetItemText: {
        fontSize: 16,
    },
});