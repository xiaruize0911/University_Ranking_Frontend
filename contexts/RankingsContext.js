import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRankingOptions } from '../lib/api';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const RankingsContext = createContext();

export const useRankings = () => {
    const context = useContext(RankingsContext);
    if (!context) {
        throw new Error('useRankings must be used within a RankingsProvider');
    }
    return context;
};

export const RankingsProvider = ({ children }) => {
    // Use React Query hook for background update
    const { data: freshData, error } = useRankingOptions({ enabled: false });
    const [rankingOptions, setRankingOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper functions for local cache
    const cacheKey = 'subjectRankingOptions';
    const cacheFile = FileSystem.documentDirectory + 'subject_ranking_options.json';

    // Load cached data on mount
    useEffect(() => {
        const loadCache = async () => {
            try {
                if (Platform.OS === 'web') {
                    const cached = window.localStorage.getItem(cacheKey);
                    if (cached) {
                        setRankingOptions(JSON.parse(cached));
                    }
                } else {
                    const info = await FileSystem.getInfoAsync(cacheFile);
                    if (info.exists) {
                        const cached = await FileSystem.readAsStringAsync(cacheFile);
                        setRankingOptions(JSON.parse(cached));
                    }
                }
            } catch (e) {
                setRankingOptions([]);
            } finally {
                setLoading(false);
            }
        };
        loadCache();
    }, []);

    // Always try to update cache in background when component mounts or page loads
    useEffect(() => {
        const updateCache = async () => {
            try {
                const { data } = await useRankingOptions().queryFn();
                if (data && Array.isArray(data)) {
                    setRankingOptions(data);
                    if (Platform.OS === 'web') {
                        window.localStorage.setItem(cacheKey, JSON.stringify(data));
                    } else {
                        await FileSystem.writeAsStringAsync(cacheFile, JSON.stringify(data));
                    }
                }
            } catch (e) {
                // Ignore errors, keep showing cached data
            }
        };
        updateCache();
    }, []);

    return (
        <RankingsContext.Provider value={{
            rankingOptions,
            loading: false, // never show loading spinner
            error
        }}>
            {children}
        </RankingsContext.Provider>
    );
};
