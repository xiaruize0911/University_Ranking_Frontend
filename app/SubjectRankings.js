import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlatList, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView, BottomSheetModal } from '@gorhom/bottom-sheet';
import Input from '../components/Input';
import Button from '../components/Button';
import { Card, CardContent, CardTitle } from '../components/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useRankings } from '../contexts/RankingsContext';
import { formatSourceName, formatSubjectName } from '../utils/textFormatter';

export default function SubjectRankingsPage() {
    const navigation = useNavigation();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { rankingOptions, loading, error } = useRankings();

    // Source selection state
    const [selectedSource, setSelectedSource] = useState(null);
    const [sourceItems, setSourceItems] = useState([]);
    const [subjectInput, setSubjectInput] = useState('');

    // Bottom sheet for source selection only
    const sourceBottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['25%', '50%'], []);

    // Extract unique sources for selection
    useEffect(() => {
        const sources = Array.from(new Set(rankingOptions.map(opt => opt.source)));
        setSourceItems([{ label: 'All Sources', value: null }, ...sources.map(s => ({ label: formatSourceName(s), value: s }))]);
    }, [rankingOptions]);

    // Filtered rankings to display
    const filteredRankings = rankingOptions.filter(opt =>
        (!selectedSource || opt.source === selectedSource) &&
        (!subjectInput || (opt.subject && opt.subject.toLowerCase().includes(subjectInput.toLowerCase())))
    );

    // Source selection handler
    const handleSourcePress = useCallback(() => {
        sourceBottomSheetRef.current?.present();
    }, []);

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
            <GestureHandlerRootView style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading rankings...</Text>
            </GestureHandlerRootView>
        );
    }

    if (error) {
        return (
            <GestureHandlerRootView style={[styles.center, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.text }]}>Error loading rankings. Please try again.</Text>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Rankings By Subject and Source</Text>

            <View style={styles.filterRow}>
                <View style={[styles.filterBlock]}>
                    <Button
                        title={selectedSource ? formatSourceName(selectedSource) : "Select Source"}
                        onPress={handleSourcePress}
                        variant="outline"
                        textStyle={{ color: theme.text }}
                        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    />
                </View>
                <View style={styles.filterBlock}>
                    <Input
                        placeholder="Subject/Region"
                        value={subjectInput}
                        onChangeText={setSubjectInput}
                        style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
                    />
                </View>
            </View>

            <FlatList
                style={{ marginTop: 10 }}
                data={filteredRankings}
                keyExtractor={(item, idx) => `${item.source}-${item.subject}-${idx}`}
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
                                        {item.top_universities.slice(0, 3).map((uni, uniIdx) => (
                                            <TouchableOpacity
                                                key={uni.name || uniIdx}
                                                onPress={() => navigation.navigate('DetailPage', { normalized_name: uni.normalized_name, name: uni.name })}
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
                                                                height: 80,
                                                                alignSelf: 'center',
                                                                marginBottom: 8
                                                            }
                                                    ]}
                                                >
                                                    <Text style={[styles.rankNumber, { color: theme.primary }]}>#{uniIdx + 1}</Text>
                                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }}>
                                                        <Text style={[
                                                            styles.universityName,
                                                            { color: theme.text },
                                                            direction === 'row'
                                                                ? { fontSize: 12, lineHeight: 14 }
                                                                : { fontSize: 14, lineHeight: 18 }
                                                        ]}>{uni.name ? uni.name : uni.normalized_name}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </CardContent>
                        </Card>
                    </TouchableOpacity>
                )}
                ListHeaderComponent={<View />}
            />

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
                    <Text style={[styles.sheetTitle, { color: theme.text }]}>Select Source</Text>
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
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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