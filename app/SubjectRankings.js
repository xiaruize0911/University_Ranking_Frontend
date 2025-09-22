import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlatList, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetModal } from '@gorhom/bottom-sheet';
import Input from '../components/Input';
import Button from '../components/Button';
import { Card, CardContent, CardTitle } from '../components/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRankings } from '../contexts/RankingsContext';
import { formatSourceName, formatSubjectName } from '../utils/textFormatter';
import { getUniversityName } from '../lib/universityNameTranslations';
import { getUniversityDetails } from '../lib/api';
import i18n from '../lib/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SubjectRankingsPage() {
    const navigation = useNavigation();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { currentLanguage } = useLanguage();
    const { rankingOptions, loading, error } = useRankings();

    // Source selection state
    const [selectedSource, setSelectedSource] = useState(null);
    const [sourceItems, setSourceItems] = useState([]);
    const [subjectInput, setSubjectInput] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // Bottom sheet for source selection only
    const sourceBottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['25%', '50%'], []);

    // Extract unique sources for selection
    useEffect(() => {
        const sources = Array.from(new Set(rankingOptions.map(opt => opt.source)));
        setSourceItems([{ label: i18n.t('all_sources'), value: null }, ...sources.map(s => ({ label: formatSourceName(s), value: s }))]);
    }, [rankingOptions]);

    // Filtered rankings to display
    const filteredRankings = rankingOptions.filter(opt =>
        (!selectedSource || opt.source === selectedSource) &&
        (!subjectInput || (opt.subject && (opt.subject.toLowerCase().includes(subjectInput.toLowerCase()))) || (opt.subject && (opt.subject.toLowerCase().replace('_', ' ').includes(subjectInput.toLowerCase()))))
    );

    // Source selection handler
    const handleSourcePress = useCallback(() => {
        sourceBottomSheetRef.current?.present();
    }, []);

    const handleSearchIconPress = useCallback(() => {
        // Close all other panels when opening search
        setShowFilterMenu(false);
        sourceBottomSheetRef.current?.dismiss();
        setIsSearchExpanded(!isSearchExpanded);
    }, [isSearchExpanded]);

    const handleFiltersIconPress = useCallback(() => {
        // Close all other panels when opening filter menu
        setIsSearchExpanded(false);
        sourceBottomSheetRef.current?.dismiss();
        setShowFilterMenu(!showFilterMenu);
    }, [showFilterMenu]);

    const handleSourceFilterPress = useCallback(() => {
        // Close all other panels when opening source sheet
        setIsSearchExpanded(false);
        setShowFilterMenu(false);
        sourceBottomSheetRef.current?.present();
    }, []);

    // Function to check if university exists before navigating
    const handleUniversityPress = useCallback(async (normalizedName, displayName) => {
        try {
            console.log("Checking university existence for:", normalizedName);
            const result = await getUniversityDetails(normalizedName);
            console.log("University details fetched:", result.notFound);
            if (!result.notFound) {
                // University exists, navigate to detail page
                navigation.navigate('DetailPage', {
                    normalized_name: normalizedName,
                    name: displayName
                });
            }
            // If not found, do nothing (no navigation)
        } catch (error) {
            console.warn('Error checking university existence:', error);
            // On error, do nothing (no navigation)
        }
    }, [navigation]);

    const [direction, setDirection] = useState('row');
    const windowDimensions = Dimensions.get('window');
    const [dimensions, setDimensions] = useState({ window: windowDimensions });

    useEffect(() => {
        const subscription = Dimensions.addEventListener(
            'change',
            ({ window }) => {
                setDimensions({ window });
            },
        );
        return () => subscription?.remove();
    }, []);

    useEffect(() => {
        console.log(dimensions.window.width, dimensions.window.height);
        if (dimensions.window.width < dimensions.window.height)
            setDirection('column');
        else
            setDirection('row');
    }, [dimensions]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{i18n.t('loading_rankings')}</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.text }]}>{i18n.t('error_loading_rankings')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{i18n.t('rankings_of_subjects_regions')}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={handleSearchIconPress}
                    >
                        <Ionicons name="search" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={handleFiltersIconPress}
                    >
                        <Ionicons name="filter" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Menu */}
            {showFilterMenu && (
                <View style={[styles.filterMenu, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <TouchableOpacity
                        style={styles.filterMenuItem}
                        onPress={handleSourceFilterPress}
                    >
                        <Ionicons name="school" size={20} color={theme.text} />
                        <Text style={[styles.filterMenuText, { color: theme.text }]}>{i18n.t('select_source')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Expandable Search Input */}
            {isSearchExpanded && (
                <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
                        placeholder={i18n.t('subject_region')}
                        placeholderTextColor={theme.textSecondary}
                        value={subjectInput}
                        onChangeText={setSubjectInput}
                        autoFocus={true}
                    />
                </View>
            )}

            {/* Main Content */}
            <View style={styles.content}>
                <FlatList
                    style={{ marginTop: 0 }}
                    data={filteredRankings}
                    keyExtractor={(item, idx) => `${item.source}-${item.subject}-${idx}`}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('RankingDetailPage', {
                                    table: item.table,
                                    source: item.source,
                                    subject: item.subject
                                });
                            }}
                            activeOpacity={0.8}
                        >
                            <Card style={[styles.card, { backgroundColor: theme.surface }]}>
                                <CardContent>
                                    <CardTitle style={[styles.cardTitle, { color: theme.text }]}>
                                        {formatSourceName(item.source)} - {formatSubjectName(item.subject)}
                                    </CardTitle>
                                    {item.top_universities && item.top_universities.length > 0 && (
                                        <View style={[styles.topUContainer, { flexDirection: direction }]}>
                                            {item.top_universities.slice(0, 3).map((uni, uniIdx) => {
                                                const displayName = getUniversityName(uni.normalized_name, currentLanguage);
                                                return (
                                                    <TouchableOpacity
                                                        key={uni.normalized_name || uniIdx}
                                                        onPress={() => handleUniversityPress(uni.normalized_name, displayName)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <View
                                                            style={[
                                                                styles.top_u_block,
                                                                {
                                                                    backgroundColor: theme.surfaceSecondary,
                                                                    borderLeftColor: theme.primary,
                                                                },
                                                                direction === 'row'
                                                                    ? {
                                                                        width: (dimensions.window.width - 80) / 3,
                                                                        height: (dimensions.window.width - 80) / 3,
                                                                        flex: 0
                                                                    }
                                                                    : {
                                                                        width: dimensions.window.width - 80,
                                                                        alignSelf: 'center',
                                                                        marginBottom: 8
                                                                    }
                                                            ]}
                                                        >
                                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }}>
                                                                <Text>
                                                                    <Text style={[styles.rankNumber, { color: theme.primary, fontWeight: 'bold' }]}>{i18n.t('rank_prefix')}{uniIdx + 1} </Text>
                                                                    <Text style={[
                                                                        styles.universityName,
                                                                        { color: theme.text },
                                                                        direction === 'row'
                                                                            ? { fontSize: 12, lineHeight: 14 }
                                                                            : { fontSize: 14, lineHeight: 18 }
                                                                    ]}>
                                                                        {displayName}
                                                                    </Text>
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}
                                </CardContent>
                            </Card>
                        </TouchableOpacity>
                    )
                    }
                    ListHeaderComponent={< View />}
                />
            </View>

            {/* Source Selection Bottom Sheet Modal */}
            <BottomSheetModal
                ref={sourceBottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backgroundStyle={{ backgroundColor: theme.surface }}
                handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
            >
                <BottomSheetScrollView style={[styles.sheetContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sheetTitle, { color: theme.text }]}>{i18n.t('select_source')}</Text>
                    {sourceItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.value || `key-${index}`}
                            style={[styles.sheetItem, { borderBottomColor: theme.border }]}
                            onPress={() => {
                                setSelectedSource(item.value);
                                sourceBottomSheetRef.current?.dismiss();
                            }}
                        >
                            <Text style={[styles.sheetItemText, { color: theme.text }]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </BottomSheetScrollView>
            </BottomSheetModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        padding: 8,
        marginLeft: 8,
    },
    filterMenu: {
        borderBottomWidth: 1,
    },
    filterMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filterMenuText: {
        fontSize: 16,
        marginLeft: 12,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    card: {
        marginBottom: 16,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 12,
        lineHeight: 24,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
    },
    filterBlock: {
        flex: 1,
    },
    topUContainer: {
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 8,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%'
    },
    top_u_block: {
        alignItems: 'center',
        textAlign: 'center',
        alignContent: 'center',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 3,
    },
    rankNumber: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    universityName: {
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 18,
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