import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await axiosClient.get('/notifications/unread-count');
      setUnreadCount(Number(res));
    } catch (err) {
      // Don't log 401/403 as errors during polling to keep console clean
      if (err.status !== 401 && err.status !== 403) {
        console.error('Error fetching unread count:', err);
      }
    }
  };

  const startPolling = () => {
    if (pollingRef.current) return;
    fetchUnreadCount();
    pollingRef.current = setInterval(fetchUnreadCount, 30000); // 30 seconds
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  useEffect(() => {
    // Check if user is logged in
    const checkLoginAndStart = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        startPolling();
      }
    };
    
    checkLoginAndStart();
    return () => stopPolling();
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, startPolling, stopPolling }}>
      {children}
    </NotificationContext.Provider>
  );
};
