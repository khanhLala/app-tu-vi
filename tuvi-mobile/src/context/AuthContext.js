import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: null,
        isAdmin: false,
        isLoading: true,
        user: null
    });

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setAuth({ token: null, isAdmin: false, isLoading: false, user: null });
                return;
            }

            // Verify token by fetching profile
            const profile = await axiosClient.get('/users/my-info');
            const isAdmin = profile.roles && profile.roles.some(r => r === 'ADMIN' || r.name === 'ADMIN');
            
            setAuth({
                token,
                isAdmin,
                isLoading: false,
                user: profile
            });
        } catch (error) {
            console.log('AuthContext check error:', error);
            // If error (e.g. token expired), clear it
            await AsyncStorage.removeItem('token');
            setAuth({ token: null, isAdmin: false, isLoading: false, user: null });
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (token, profile) => {
        try {
            await AsyncStorage.setItem('token', token);
            const isAdmin = profile.roles && profile.roles.some(r => r === 'ADMIN' || r.name === 'ADMIN');
            setAuth({
                token,
                isAdmin,
                isLoading: false,
                user: profile
            });
        } catch (error) {
            console.error('Login context error:', error);
        }
    };

    const logout = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                // Background attempt to notify backend, don't wait indefinitely
                axiosClient.post('/auth/logout', { token }).catch(e => 
                    console.log('Backend logout failed (intended):', e.message)
                );
            }
        } catch (error) {
            console.error('Logout preprocessing error:', error);
        } finally {
            // Always clear local state
            await AsyncStorage.removeItem('token');
            if (Platform.OS === 'web') {
                localStorage.removeItem('token');
            }
            
            setAuth({ token: null, isAdmin: false, isLoading: false, user: null });
            
            if (Platform.OS === 'web') {
                console.log('>>> WEB LOGOUT - Refreshing page to clear all states...');
                window.location.reload();
            }
        }
    };

    return (
        <AuthContext.Provider value={{ ...auth, login, logout, refreshProfile: checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
