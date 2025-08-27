import { API_BASE_URL } from '../constants/config';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Raw API functions (without React Query)
const rawApi = {
    async getRankingDetail({ table, source, subject }) {
        console.log('Fetching ranking detail with params:', { table, source, subject });
        const response = await axios.get(`${API_BASE_URL}/subject_rankings/ranking_detail`, {
            params: { table, source, subject }
        });
        console.log('Ranking detail response:', response.data);
        return response.data;
    },

    async searchUniversities({ query, country, city, sort_credit }) {
        const response = await axios.get(`${API_BASE_URL}/universities/filter`, {
            params: { query, country, city, sort_credit }
        });
        return response.data;
    },

    async getUniversity(id) {
        const response = await axios.get(`${API_BASE_URL}/universities/${id}`);
        return response.data;
    },

    async getRankingOptions() {
        const response = await axios.get(`${API_BASE_URL}/dropdown/ranking_options`);
        return response.data;
    },

    async getCountries() {
        const response = await axios.get(`${API_BASE_URL}/dropdown/countries`);
        return response.data;
    },

    async getCities(country) {
        let response;
        if (country) {
            response = await axios.get(`${API_BASE_URL}/dropdown/cities?country=${country}`);
        } else {
            response = await axios.get(`${API_BASE_URL}/dropdown/cities`);
        }
        return response.data;
    },

    async getUniversityRankingsBySource(normalizedName, source) {
        const response = await axios.get(`${API_BASE_URL}/universities/${normalizedName}/rankings/${source}`);
        return response.data;
    }
};

// React Query hooks for components that want to use them
export const useRankingDetail = ({ table, source, subject }, options = {}) => {
    return useQuery({
        queryKey: ['rankingDetail', { table, source, subject }],
        queryFn: () => rawApi.getRankingDetail({ table, source, subject }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options
    });
};

export const useSearchUniversities = ({ query, country, city, sort_credit }, options = {}) => {
    return useQuery({
        queryKey: ['searchUniversities', { query, country, city, sort_credit }],
        queryFn: () => rawApi.searchUniversities({ query, country, city, sort_credit }),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!(query || country || city || sort_credit), // Only run if there are search params
        ...options
    });
};

export const useUniversity = (id, options = {}) => {
    return useQuery({
        queryKey: ['university', id],
        queryFn: () => rawApi.getUniversity(id),
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!id,
        ...options
    });
};

export const useRankingOptions = (options = {}) => {
    return useQuery({
        queryKey: ['rankingOptions'],
        queryFn: rawApi.getRankingOptions,
        staleTime: 30 * 60 * 1000, // 30 minutes
        ...options
    });
};

export const useCountries = (options = {}) => {
    return useQuery({
        queryKey: ['countries'],
        queryFn: rawApi.getCountries,
        staleTime: 60 * 60 * 1000, // 1 hour
        ...options
    });
};

export const useCities = (country, options = {}) => {
    return useQuery({
        queryKey: ['cities', country],
        queryFn: () => rawApi.getCities(country),
        staleTime: 30 * 60 * 1000, // 30 minutes
        ...options
    });
};

export const useUniversityRankingsBySource = (normalizedName, source, options = {}) => {
    return useQuery({
        queryKey: ['universityRankings', normalizedName, source],
        queryFn: () => rawApi.getUniversityRankingsBySource(normalizedName, source),
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!(normalizedName && source),
        ...options
    });
};

// Legacy API functions that maintain the same interface for existing code
// These now use React Query internally but provide the same async function interface

export async function getRankingDetail({ table, source, subject }) {
    try {
        return await rawApi.getRankingDetail({ table, source, subject });
    } catch (error) {
        console.error('Error fetching ranking detail:', error);
        console.error('Request params:', { table, source, subject });
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        return [];
    }
}

export async function searchUniversities({ query, country, city, sort_credit }) {
    try {
        return await rawApi.searchUniversities({ query, country, city, sort_credit });
    } catch (error) {
        console.error('Error searching universities:', error);
        return [];
    }
}

export async function getUniversity(id) {
    try {
        return await rawApi.getUniversity(id);
    } catch (error) {
        console.error(`Error fetching university with id ${id}:`, error);
        return null;
    }
}

export async function getRankingOptions() {
    try {
        return await rawApi.getRankingOptions();
    } catch (error) {
        console.error('Error fetching ranking options:', error);
        return [];
    }
}

export async function getCountries() {
    try {
        return await rawApi.getCountries();
    } catch (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
}

export async function getCities(country) {
    try {
        return await rawApi.getCities(country);
    } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
}

export async function getUniversityRankingsBySource(normalizedName, source) {
    try {
        return await rawApi.getUniversityRankingsBySource(normalizedName, source);
    } catch (error) {
        console.error('Error fetching university rankings by source:', error);
        return null;
    }
}