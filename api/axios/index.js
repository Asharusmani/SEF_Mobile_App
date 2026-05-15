import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CMD mein ipconfig chalaao aur sahi IP lagao
const BASE_URL = 'http://192.168.18.97:3000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true, // refreshToken cookie ke liye
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request: har request mein Bearer token lagao ─────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('[Axios] Token read error:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response: 401 pe refresh karo ───────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Backend cookie se refreshToken khud padhega
        const res = await apiClient.post('/auth/refresh-token');
        const newToken = res.data.data.token;
        await AsyncStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'user']);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;