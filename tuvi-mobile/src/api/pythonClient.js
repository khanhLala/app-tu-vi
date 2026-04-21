import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const pythonClient = axios.create({
  baseURL: Platform.OS === 'web' ? 'http://localhost:8000/api/v1' : 'http://192.168.110.42:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

pythonClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

pythonClient.interceptors.response.use((response) => {
  return response.data;
}, (error) => {
  if (error.response && error.response.data) {
    return Promise.reject(error.response.data);
  }
  return Promise.reject(error);
});

export default pythonClient;
