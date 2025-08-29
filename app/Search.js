import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Animated, Easing, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView, BottomSheetModal } from '@gorhom/bottom-sheet';
import { searchUniversities, getCountries } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRankings } from '../contexts/RankingsContext';
import i18n from '../lib/i18n';

export default function SearchScreen() {
    // Animated spinner for loading
    const spinValue = useRef(new Animated.Value(0)).current;

    const navigation = useNavigation();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { currentLanguage } = useLanguage();
    const { rankingOptions: subjectRankingOptions = [], loading: rankingsLoading = true } = useRankings();
    const [query, setQuery] = useState('');
    const [country, setCountry] = useState(null);
    const [sortCredit, setSortCredit] = useState('QS_World_University_Rankings');
    const [countrySearchQuery, setCountrySearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [allCountries, setAllCountries] = useState([]);
    const [rankingOptions, setRankingOptions] = useState([
        { label: i18n.t('us_news_best_global'), value: 'US_News_best global universities_Rankings' },
        { label: i18n.t('qs_world_university_rankings'), value: 'QS_World_University_Rankings' }
    ]);

    const countrySheetRef = useRef(null);
    const rankingSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['60%', '75%', '90%'], []);

    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            spinValue.setValue(0);
        }
    }, [isLoading]);

    // --- Data Fetching Logic ---
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!isMounted) return;

            setIsLoading(true);
            try {
                const data = await searchUniversities({ query, country, sort_credit: sortCredit });
                if (!isMounted) return;

                const cleaned = data.map(u => ({
                    ...u,
                    country: u.country || i18n.t('not_available'),
                    city: u.city || i18n.t('not_available')
                }));
                setResults(cleaned);
            } catch (error) {
                console.error('Error fetching universities:', error);
                if (isMounted) {
                    setResults([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [query, country, sortCredit]);

    useEffect(() => {
        (async () => {
            // Start with default ranking options
            let searchRankingOptions = [
                { label: i18n.t('qs_world_university_rankings'), value: 'QS_World_University_Rankings' },
                { label: i18n.t('us_news_best_global'), value: 'US_News_best global universities_Rankings' }
            ];

            setRankingOptions(searchRankingOptions);

            const countryOpts = await getCountries();
            setAllCountries(countryOpts);
        })();
    }, [subjectRankingOptions, rankingsLoading]);

    const countryItems = useMemo(() => [
        { label: i18n.t('all_countries'), value: null },
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
        rankingSheetRef.current?.dismiss(); // Close ranking sheet if open
        countrySheetRef.current?.present();
    }, []);

    const handleRankingPress = useCallback(() => {
        countrySheetRef.current?.dismiss(); // Close country sheet if open
        rankingSheetRef.current?.present();
    }, []);

    // Find the label for the current sortCredit value
    const selectedRankingLabel = useMemo(() => {
        const found = rankingItems.find(item => item.value === sortCredit);
        return found ? found.label : i18n.t('sort_by');
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
                    <Text style={[styles.rankText, { color: theme.primary }]}>{i18n.t('rank_prefix')}{index + 1}</Text>
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
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
                    placeholder={i18n.t('search_university_here')}
                    placeholderTextColor={theme.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={handleCountryPress}
                >
                    <Text style={[styles.buttonText, { color: theme.text }]}>{country || i18n.t('all_countries')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={handleRankingPress}
                >
                    <Text style={[styles.buttonText, { color: theme.text }]}>{selectedRankingLabel}</Text>
                </TouchableOpacity>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Animated.View style={{
                            transform: [{ rotate: spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
                            marginBottom: 16,
                        }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </Animated.View>
                        <Text style={{ color: theme.textSecondary, fontSize: 16, fontWeight: '500' }}>{i18n.t('loading_rankings')}</Text>
                    </View>
                ) : (
                    <FlatList
                        style={styles.resultsList}
                        data={results}
                        keyExtractor={(item, index) => `${item.normalized_name}-${index}`}
                        renderItem={renderUniversityCard}
                        ListHeaderComponent={<View />}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <BottomSheetModal
                ref={countrySheetRef}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backgroundStyle={{ backgroundColor: theme.surface }}
                handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
                topInset={50}
            >
                <BottomSheetScrollView style={[styles.sheetContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sheetTitle, { color: theme.text }]}>{i18n.t('select_country')}</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
                        placeholder={i18n.t('search_countries')}
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
                                countrySheetRef.current?.dismiss();
                            }}
                        >
                            <Text style={[styles.sheetItemText, { color: theme.text }]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </BottomSheetScrollView>
            </BottomSheetModal>

            <BottomSheetModal
                ref={rankingSheetRef}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backgroundStyle={{ backgroundColor: theme.surface }}
                handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
            >
                <BottomSheetScrollView style={[styles.sheetContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sheetTitle, { color: theme.text }]}>{i18n.t('select_ranking')}</Text>
                    {rankingItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.value || `key-${index}`}
                            style={[styles.sheetItem, { borderBottomColor: theme.border }]}
                            onPress={() => {
                                setSortCredit(item.value);
                                rankingSheetRef.current?.dismiss();
                            }}
                        >
                            <Text style={[styles.sheetItemText, { color: theme.text }]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </BottomSheetScrollView>
            </BottomSheetModal>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
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
        paddingBottom: 100,
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