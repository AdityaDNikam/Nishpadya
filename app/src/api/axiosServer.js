import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export const axiosServer = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json"
    },
})

