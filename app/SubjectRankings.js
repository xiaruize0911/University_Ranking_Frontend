import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getRankingOptions } from '../lib/api';
import { FlatList, Dimensions } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export default function SubjectRankingsPage() {
    const navigation = useNavigation();
    const [rankingOptions, setRankingOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dropdown state
    const [sourceOpen, setSourceOpen] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
    const [sourceItems, setSourceItems] = useState([]);
    const [subjectInput, setSubjectInput] = useState('');
    const [subjectOpen, setSubjectOpen] = useState(false);

    useEffect(() => {
        async function fetchOptions() {
            setLoading(true);
            const options = await getRankingOptions();
            setRankingOptions(options);
            setLoading(false);
        }
        fetchOptions();
    }, []);

    // Extract unique sources for dropdown
    useEffect(() => {
        const sources = Array.from(new Set(rankingOptions.map(opt => opt.source)));
        setSourceItems([...sources.map(s => ({ label: s, value: s })), { label: 'All Sources', value: null }]);
    }, [rankingOptions]);

    useEffect(() => {
        if (subjectOpen) {
            setSourceOpen(false);
        }
    }, [subjectOpen])

    useEffect(() => {
        if (sourceOpen) {
            setSubjectOpen(false);
        }
    }, [sourceOpen]);

    // Filtered rankings to display
    const filteredRankings = rankingOptions.filter(opt =>
        (!selectedSource || opt.source === selectedSource) &&
        (!subjectInput || (opt.subject && opt.subject.toLowerCase().includes(subjectInput.toLowerCase())))
    );

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
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Loading rankings...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rankings By Subject and Source</Text>
            <View style={styles.filterRow}>
                <View style={styles.filterBlock}>
                    <DropDownPicker
                        open={sourceOpen}
                        value={selectedSource}
                        items={sourceItems}
                        setOpen={setSourceOpen}
                        setValue={setSelectedSource}
                        setItems={setSourceItems}
                        placeholder="Select Source"
                        listMode="SCROLLVIEW"
                        style={styles.dropdown}
                        textStyle={styles.dropdownText}
                        placeholderStyle={styles.placeholderStyle}
                    />
                </View>
                <View style={styles.filterBlock}>
                    <TextInput
                        style={styles.input_block}
                        placeholder="Subject/Region"
                        placeholderTextColor="#6c757d"
                        value={subjectInput}
                        onChangeText={setSubjectInput}
                        editable={true}
                    />
                </View>
            </View>
            <FlatList
                style={{ marginTop: 10 }}
                data={filteredRankings}
                keyExtractor={(item, idx) => `${item.source}-${item.subject}-${idx}`}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('RankingDetailPage', {
                            table: item.table,
                            source: item.source,
                            subject: item.subject
                        })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.card}>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={styles.cardTitle}>{item.source} - {item.subject}</Text>
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
                                                    <Text style={styles.rankNumber}>#{uniIdx + 1}</Text>
                                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }}>
                                                        <Text style={[
                                                            styles.universityName,
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
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListHeaderComponent={<View />}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6c757d',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#2c3e50'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#2c3e50',
        marginBottom: 12,
        lineHeight: 24,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
        zIndex: 100,
    },
    filterBlock: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e1e5e9',
        zIndex: 100,
    },
    dropdown: {
        borderColor: 'transparent',
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    dropdownText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    placeholderStyle: {
        color: '#6c757d',
        fontSize: 16,
    },
    input_block: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#2c3e50',
        borderWidth: 0,
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
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
        textAlign: 'center',
        alignContent: 'center',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#4a90e2'
    },
    rankNumber: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#4a90e2',
        marginBottom: 4,
    },
    universityName: {
        fontWeight: '600',
        fontSize: 14,
        color: '#2c3e50',
        textAlign: 'center',
        lineHeight: 18,
    }
});