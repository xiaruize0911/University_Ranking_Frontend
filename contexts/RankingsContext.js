import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRankingOptions } from '../lib/api';

const RankingsContext = createContext();

export const useRankings = () => {
    const context = useContext(RankingsContext);
    if (!context) {
        throw new Error('useRankings must be used within a RankingsProvider');
    }
    return context;
};

export const RankingsProvider = ({ children }) => {
    // Use React Query hook for automatic caching and background updates
    const { data: rankingOptions = [], isLoading: loading, error } = useRankingOptions();

    return (
        <RankingsContext.Provider value={{
            rankingOptions,
            loading,
            error
        }}>
            {children}
        </RankingsContext.Provider>
    );
};
