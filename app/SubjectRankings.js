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
                <ActivityIndicator size="large" />
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
                    />
                </View>
                <View style={styles.filterBlock}>
                    <TextInput
                        open={subjectOpen}
                        style={styles.input_block}
                        backgroundColor="#ffffff"
                        placeholder="Subject/Region"
                        placeholderTextColor="#888"
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
                        <View style={[styles.card,]}>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'black', marginBottom: 6 }}>{item.source} - {item.subject}</Text>
                                {item.top_universities && item.top_universities.length > 0 && (
                                    <View style={[styles.topUContainer, { flexDirection: direction }]}>
                                        {item.top_universities.slice(0, 3).map((uni, uniIdx) => (
                                            <View
                                                style={[
                                                    styles.top_u_block,
                                                    direction === 'row'
                                                        ? { minWidth: '30%', minHeight: 60, maxWidth: 120, flex: 1 }
                                                        : { minHeight: 60, width: '100%', maxWidth: 300, alignSelf: 'center' }
                                                ]}
                                                key={uni.name || uniIdx}
                                            >
                                                <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#666' }}>#{uniIdx + 1}</Text>
                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#222', textAlign: 'center' }}> {uni.name ? uni.name : uni.normalized_name}</Text>
                                                </View>
                                            </View>
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
        backgroundColor: '#fff'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    card: {
        backgroundColor: '#fefdaaff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        marginTop: 10
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 10,
        zIndex: 100,
    },
    filterBlock: {
        flex: 1,
        backgroundColor: '#ffffffff',
        borderRadius: 8,
        padding: 6,
        marginHorizontal: 2,
        zIndex: 100,
    },
    input_block: {
        flex: 1,
        backgroundColor: '#ffffffff',
        borderRadius: 8,
        padding: 6,
        marginHorizontal: 2,
        borderWidth: 1
    },
    topUContainer: {
        justifyContent: 'space-between',
        marginTop: 6,
        gap: 6,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%'
    },
    top_u_block: {
        backgroundColor: '#b1f4f6ff',
        alignItems: 'center',
        textAlign: 'center',
        alignContent: 'center',
        borderRadius: 8,
        margin: 2
    }
});