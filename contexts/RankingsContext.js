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
    const { data: freshData, error, isLoading } = useRankingOptions();
    const [rankingOptions, setRankingOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper functions for local cache
    const cacheKey = 'subjectRankingOptions';
    const cacheFile = FileSystem.documentDirectory + 'subject_ranking_options.json';

    // Load cached data on mount
    useEffect(() => {
        let isMounted = true;

        const loadCache = async () => {
            try {
                let cachedData = null;

                if (Platform.OS === 'web') {
                    const cached = window.localStorage.getItem(cacheKey);
                    if (cached) {
                        cachedData = JSON.parse(cached);
                    }
                } else {
                    const info = await FileSystem.getInfoAsync(cacheFile);
                    if (info.exists) {
                        const cached = await FileSystem.readAsStringAsync(cacheFile);
                        cachedData = JSON.parse(cached);
                    }
                }

                if (isMounted && cachedData && Array.isArray(cachedData)) {
                    setRankingOptions(cachedData);
                }
                if (isMounted) {
                    setLoading(false);
                }
            } catch (e) {
                console.error('Error loading cached ranking options:', e);
                if (isMounted) {
                    setRankingOptions([]);
                    setLoading(false);
                }
            }
        };

        loadCache();

        return () => {
            isMounted = false;
        };
    }, []);

    // Update cache when fresh data is available
    useEffect(() => {
        let isMounted = true;

        const updateCache = async () => {
            if (!isMounted || !freshData || !Array.isArray(freshData) || freshData.length === 0) {
                return;
            }

            setRankingOptions(freshData);
            setLoading(false);

            try {
                if (Platform.OS === 'web') {
                    window.localStorage.setItem(cacheKey, JSON.stringify(freshData));
                } else {
                    await FileSystem.writeAsStringAsync(cacheFile, JSON.stringify(freshData));
                }
            } catch (e) {
                console.error('Error saving ranking options to cache:', e);
            }
        };

        if (!isLoading && freshData) {
            updateCache();
        }

        return () => {
            isMounted = false;
        };
    }, [freshData, isLoading]);

    const contextValue = {
        rankingOptions: rankingOptions || [],
        loading,
        error
    };

    return (
        <RankingsContext.Provider value={contextValue}>
            {children}
        </RankingsContext.Provider>
    );
};
