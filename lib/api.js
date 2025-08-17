// Get ranking details for a specific ranking
export async function getRankingDetail({ table, source, subject }) {
    try {
        const response = await axios.get(`${API_BASE_URL}/subject_rankings/ranking_detail`, {
            params: { table, source, subject }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching ranking detail:', error);
        return [];
    }
}
import { API_BASE_URL } from '../constants/config';
import axios from 'axios';

// Search universities with filters
export async function searchUniversities({ query, country, city, sort_credit }) {
    try {
        const response = await axios.get(`${API_BASE_URL}/universities/filter`, {
            params: { query, country, city, sort_credit }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching universities:', error);
        return [];
    }
}

// Get full university details by ID
export async function getUniversity(id) {
    try {
        const response = await axios.get(`${API_BASE_URL}/universities/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching university with id ${id}:`, error);
        return null;
    }
}

// Get available ranking sources/subjects (for dropdowns)
export async function getRankingOptions() {
    try {
        const response = await axios.get(`${API_BASE_URL}/dropdown/ranking_options`);
        return response.data;
    } catch (error) {
        console.error('Error fetching ranking options:', error);
        return [];
    }
}

// Get available countries (for dropdowns)
export async function getCountries() {
    try {
        const response = await axios.get(`${API_BASE_URL}/dropdown/countries`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
}

// Get available cities (for dropdowns)
export async function getCities(country) {
    try {
        response = Object.create(null);
        if (country) {
            response = await axios.get(`${API_BASE_URL}/dropdown/cities?country=${country}`);
        }
        else {
            response = await axios.get(`${API_BASE_URL}/dropdown/cities`);
        }

        return response.data;
    }
    catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
}

// Get university rankings by source
export async function getUniversityRankingsBySource(normalizedName, source) {
    try {
        const response = await axios.get(`${API_BASE_URL}/universities/${normalizedName}/rankings/${source}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching university rankings by source:', error);
        return null;
    }
}