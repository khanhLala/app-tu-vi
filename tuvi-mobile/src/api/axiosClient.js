import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.7.47:8080/api/v1',


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
  // Chuẩn hóa URL để kiểm tra (bỏ baseURL nếu có)
  const url = config.url || '';
  const publicEndpoints = ['/auth/token', '/auth/introspect', '/users'];
  
  // Kiểm tra xem có phải endpoint công khai không
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    url === endpoint || url.endsWith(endpoint)
  );

  // Nếu là POST vào endpoint công khai thì không gửi token
  if (isPublicEndpoint && config.method?.toLowerCase() === 'post') {
    console.log(`[Request] Public endpoint detected: ${url}, skipping token.`);
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
  if (response.data) {
    if (response.data.code === 1000) {
      return response.data.result;
    } else {
      // Nếu có code khác 1000 thì coi như lỗi và reject
      return Promise.reject(response.data);
    }
  }
  return response;
}, async (error) => {
  const { config, response } = error;
  const originalRequest = config;

  // Nếu là lỗi 401 và không phải là yêu cầu refresh chính nó hoặc yêu cầu login
  const isAuthRequest = originalRequest.url.endsWith('/auth/token') || originalRequest.url.endsWith('/auth/refresh');

  if (response && response.status === 401 && !isAuthRequest && !originalRequest._retry) {
    if (originalRequest.url.endsWith('/auth/refresh')) {
      // Nếu chính request refresh cũng lỗi 401 thì logout luôn
      console.log('[Response] Refresh token failed with 401, logging out.');
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
