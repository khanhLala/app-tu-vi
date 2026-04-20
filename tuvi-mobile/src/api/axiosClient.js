import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 
           (Platform.OS === 'web' ? 'http://localhost:8080/api/v1' : 'http://192.168.1.7:8080/api/v1'), 
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

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

// Interceptor để xử lý lỗi tập trung từ ApiResponse của Spring Boot và Silent Refresh
axiosClient.interceptors.response.use((response) => {
  if (response.data && response.data.code === 1000) {
    return response.data.result;
  }
  return response;
}, async (error) => {
  const { config, response } = error;
  const originalRequest = config;

  // Nếu là lỗi 401 và không phải là yêu cầu refresh chính nó
  if (response && response.status === 401 && !originalRequest._retry) {
    if (originalRequest.url.endsWith('/auth/refresh')) {
        // Nếu chính request refresh cũng lỗi 401 thì logout luôn
        await AsyncStorage.removeItem('token');
        return Promise.reject(error);
    }

    if (isRefreshing) {
      // Nếu đang refresh, gom các request lỗi vào hàng đợi
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const currentToken = await AsyncStorage.getItem('token');
      // Gọi API refresh trực tiếp (dùng axios.post để tránh bị interceptor request gắn token sai)
      const refreshResponse = await axios.post(`${axiosClient.defaults.baseURL}/auth/refresh`, {
        token: currentToken
      });

      const { code, result } = refreshResponse.data;
      if (code === 1000 && result.token) {
        const newToken = result.token;
        await AsyncStorage.setItem('token', newToken);
        
        isRefreshing = false;
        onRefreshed(newToken);
        
        // Thực hiện lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      }
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];
      await AsyncStorage.removeItem('token');
      // Có thể emit một event để UI redirect về Login ở đây
      return Promise.reject(refreshError);
    }
  }

  if (error.response && error.response.data) {
    return Promise.reject(error.response.data);
  }
  return Promise.reject(error);
});

export default axiosClient;
