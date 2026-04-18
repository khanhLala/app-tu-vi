import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.113:8080/api/v1', // Lấy từ .env hoặc mặc định
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động gắn Token vào Headers
axiosClient.interceptors.request.use(async (config) => {
  // Không gắn token cho các endpoint công khai (Login, Register)
  const publicEndpoints = ['/auth/token', '/users'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.endsWith(endpoint));
  
  if (isPublicEndpoint && config.method === 'post') {
    return config;
  }

  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor để xử lý lỗi tập trung từ ApiResponse của Spring Boot
axiosClient.interceptors.response.use((response) => {
  if (response.data && response.data.code === 1000) {
    return response.data.result;
  }
  return response;
}, (error) => {
  if (error.response && error.response.data) {
    // Trả về ErrorCode và message từ Backend
    return Promise.reject(error.response.data);
  }
  return Promise.reject(error);
});

export default axiosClient;
