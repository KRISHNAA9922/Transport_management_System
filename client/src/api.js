import axios from 'axios';

// Log the backend URL being used for debugging
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

// Axios instance configured to use backend URL from environment variable VITE_BACKEND_URL
// Falls back to 'http://localhost:5000' if the environment variable is not set
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
