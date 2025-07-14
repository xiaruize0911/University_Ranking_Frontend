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
        const response = await axios.get(`${API_BASE_URL}/universities/ranking_options`);
        return response.data;
    } catch (error) {
        console.error('Error fetching ranking options:', error);
        return [];
    }
}
