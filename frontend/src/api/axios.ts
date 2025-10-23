import axios from 'axios';

const createApiClient = (baseURL: string) => {
  const api = axios.create({
    baseURL,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

export const authApi = createApiClient('http://localhost:5000/api');
export const postApi = createApiClient('http://localhost:5001/api');
export const commentApi = createApiClient('http://localhost:5002/api');
export const likeApi = createApiClient('http://localhost:5003/api');