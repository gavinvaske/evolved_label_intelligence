import axios from 'axios';

const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.Cypress) {
        return window.Cypress.env('API_URL') || '/api';
    }
    return '/api';
};

const apiClient = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient; 