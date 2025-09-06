
// Export for use in app startup (Hermes fix: avoid referencing rawApi directly)
export async function getAllUniversityNameTranslations() {
    const response = await axios.get(`${API_BASE_URL}/universities/translate/all`);
    return response.data;
}
import { API_BASE_URL, BING_TRANSLATE_API_KEY, BING_TRANSLATE_LOCATION } from '../constants/config';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { updatePreference } from './preferences';
import i18n from './i18n';

// Raw API functions (without React Query)
const rawApi = {
    async getAllUniversityNameTranslations() {
        const response = await axios.get(`${API_BASE_URL}/universities/translate/all`);
        return response.data;
    },
    async getRankingDetail({ table, source, subject }) {
        console.log('Fetching ranking detail with params:', { table, source, subject });
        const response = await axios.get(`${API_BASE_URL}/subject_rankings/ranking_detail`, {
            params: { table, source, subject }
        });
        // console.log('Ranking detail response:', response.data);
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
    },

    async translateText(text, fromLang = 'en', toLang = 'zh-Hans') {
        // Check if API key is configured
        if (!BING_TRANSLATE_API_KEY || BING_TRANSLATE_API_KEY === 'YOUR_BING_TRANSLATE_API_KEY') {
            console.warn('Bing Translate API key not configured');
            return text; // Return original text if API key not configured
        }

        // Using Microsoft Translator API (Bing Translate)
        const subscriptionKey = BING_TRANSLATE_API_KEY;
        const endpoint = 'https://api.cognitive.microsofttranslator.com';
        const location = BING_TRANSLATE_LOCATION;

        const response = await axios.post(
            `${endpoint}/translate?api-version=3.0&from=${fromLang}&to=${toLang}`,
            [{ text }],
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                    'Ocp-Apim-Subscription-Region': location,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data[0].translations[0].text;
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
        console.error(i18n.t('error_fetching_ranking_detail') + ':', error);
        console.error(i18n.t('request_params') + ':', { table, source, subject });
        console.error(i18n.t('error_details') + ':', {
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
        console.error(i18n.t('error_searching_universities') + ':', error);
        return [];
    }
}

export async function getUniversity(id) {
    try {
        return await rawApi.getUniversity(id);
    } catch (error) {
        console.error(i18n.t('error_fetching_university') + ' ' + id + ':', error);
        return null;
    }
}

export async function getRankingOptions() {
    try {
        return await rawApi.getRankingOptions();
    } catch (error) {
        console.error(i18n.t('error_fetching_ranking_options') + ':', error);
        return [];
    }
}

export async function getCountries() {
    try {
        return await rawApi.getCountries();
    } catch (error) {
        console.error(i18n.t('error_fetching_countries') + ':', error);
        return [];
    }
}

export async function getCities(country) {
    try {
        return await rawApi.getCities(country);
    } catch (error) {
        console.error(i18n.t('error_fetching_cities') + ':', error);
        return [];
    }
}

export async function getUniversityRankingsBySource(normalizedName, source) {
    try {
        return await rawApi.getUniversityRankingsBySource(normalizedName, source);
    } catch (error) {
        console.error(i18n.t('error_fetching_university_rankings') + ':', error);
        return null;
    }
}

export async function updateFavoriteCount(favoriteCount) {
    try {
        const success = await updatePreference('favoriteCount', favoriteCount);
        if (!success) {
            console.error(i18n.t('error_updating_favorites') + ':', 'Failed to save preference');
        }
    } catch (error) {
        console.error(i18n.t('error_updating_favorites') + ':', error);
    }
}

export async function translateText(text, fromLang = 'en', toLang = 'zh-Hans') {
    try {
        return await rawApi.translateText(text, fromLang, toLang);
    } catch (error) {
        console.error(i18n.t('error_translating_text') + ':', error);
        return text; // Return original text if translation fails
    }
}