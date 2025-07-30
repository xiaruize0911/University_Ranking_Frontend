import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { searchUniversities, getUniversity, getRankingOptions } from '../lib/api';

export default function TestScreen() {
    const [log, setLog] = useState([]);

    useEffect(() => {
        async function testAPIs() {
            try {
                const searchResult = await searchUniversities({ query: 'Harv', country: null, city: null, sort_credit: null });
                const detailResult = await getUniversity(1); // if ID 1 exists in your DB
                const options = await getRankingOptions();

                setLog([
                    'Search Result:',
                    JSON.stringify(searchResult, null, 2),
                    'University Detail:',
                    JSON.stringify(detailResult, null, 2),
                    'Ranking Options:',
                    JSON.stringify(options, null, 2),
                ]);
            } catch (err) {
                setLog(['Error running API tests', err.toString()]);
            }
        }

        testAPIs();
    }, []);

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            {log.map((line, index) => (
                <Text key={index} style={{ marginBottom: 10 }}>{line}</Text>
            ))}
        </ScrollView>
    );
}
