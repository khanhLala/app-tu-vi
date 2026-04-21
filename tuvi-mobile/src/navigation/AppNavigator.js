import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CreateChartScreen from '../screens/CreateChartScreen';
import ChartDetailScreen from '../screens/ChartDetailScreen';
import ProfileListScreen from '../screens/ProfileListScreen';
import SocialFeedScreen from '../screens/SocialFeedScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ShopScreen from '../screens/ShopScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SecurityScreen from '../screens/SecurityScreen';
import SupportScreen from '../screens/SupportScreen';
import NotificationScreen from '../screens/NotificationScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUserManagerScreen from '../screens/admin/AdminUserManagerScreen';
import AdminReportManagerScreen from '../screens/admin/AdminReportManagerScreen';
import AdminProductManagerScreen from '../screens/admin/AdminProductManagerScreen';
import { NotificationProvider, useNotifications } from '../context/NotificationContext';

import * as LucideWeb from 'lucide-react';
import { Platform } from 'react-native';

// Helper to handle Lucide icons on both Web and Native
const TabIcon = ({ name, color, size }) => {
    if (Platform.OS === 'web') {
        const IconComponent = LucideWeb[name];
        return IconComponent ? <IconComponent color={color} size={size} /> : null;
    }
    
    // For Native, we use requirement to avoid potential web crashes from native modules
    try {
        const LucideNative = require('lucide-react-native');
        const IconComponent = LucideNative[name];
        return IconComponent ? <IconComponent color={color} size={size} /> : null;
    } catch (e) {
        return null;
    }
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- COMPONENTS ---

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const safeBottom = insets?.bottom || 0;
    const { unreadCount } = useNotifications();

    return (
        <View style={{ 
            flexDirection: 'row', 
            height: 60 + safeBottom, 
            backgroundColor: '#0F172A', 
            borderTopWidth: 1, 
            borderTopColor: '#334155',
            paddingBottom: safeBottom > 0 ? safeBottom : 5,
            paddingTop: 5,
        }}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel || route.name;
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                let iconName;
                if (route.name === 'CalculateTab' || route.name === 'AdminDashboardTab') iconName = 'Layout';
                else if (route.name === 'ShopTab' || route.name === 'AdminProductsTab') iconName = 'ShoppingBag';
                else if (route.name === 'SocialTab' || route.name === 'AdminUsersTab') iconName = 'Users';
                else if (route.name === 'NotiTab' || route.name === 'AdminReportsTab') iconName = 'Bell';
                else if (route.name === 'SettingsTab' || route.name === 'AdminSettingsTab') iconName = 'Settings';

                return (
                    <TouchableOpacity
                        key={index}
                        onPress={onPress}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <View>
                            <TabIcon name={iconName} color={isFocused ? '#FBBF24' : '#64748B'} size={24} />
                            {(route.name === 'NotiTab' || route.name === 'AdminReportsTab') && unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    right: -6,
                                    top: -3,
                                    backgroundColor: '#EF4444',
                                    borderRadius: 10,
                                    minWidth: 16,
                                    height: 16,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1.5,
                                    borderColor: '#0F172A'
                                }}>
                                    <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={{ color: isFocused ? '#FBBF24' : '#64748B', fontSize: 10, marginTop: 2 }}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const UserTabs = () => {
    return (
        <Tab.Navigator 
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="CalculateTab" component={CreateChartScreen} options={{ tabBarLabel: "Lập lá số" }} />
            <Tab.Screen name="ShopTab" component={ShopScreen} options={{ tabBarLabel: "Cửa hàng" }} />
            <Tab.Screen name="SocialTab" component={SocialFeedScreen} options={{ tabBarLabel: "Cộng đồng" }} />
            <Tab.Screen name="NotiTab" component={NotificationScreen} options={{ tabBarLabel: "Thông báo" }} />
            <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: "Cài đặt" }} />
        </Tab.Navigator>
    );
};

const AdminTabs = () => {
    return (
        <Tab.Navigator 
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="AdminDashboardTab" component={AdminDashboardScreen} options={{ tabBarLabel: "Tổng quan" }} />
            <Tab.Screen name="AdminUsersTab" component={AdminUserManagerScreen} options={{ tabBarLabel: "Người dùng" }} />
            <Tab.Screen name="AdminProductsTab" component={AdminProductManagerScreen} options={{ tabBarLabel: "Sản phẩm" }} />
            <Tab.Screen name="AdminReportsTab" component={AdminReportManagerScreen} options={{ tabBarLabel: "Báo cáo" }} />
            <Tab.Screen name="AdminSettingsTab" component={SettingsScreen} options={{ tabBarLabel: "Cài đặt" }} />
        </Tab.Navigator>
    );
};

// --- MAIN NAVIGATOR ---

const AdminStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0F172A' } }}>
        <Stack.Screen name="AdminMain" component={AdminTabs} />
        <Stack.Screen name="AdminUsers" component={AdminUserManagerScreen} />
        <Stack.Screen name="AdminReports" component={AdminReportManagerScreen} />
        <Stack.Screen name="AdminProducts" component={AdminProductManagerScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
);

const UserStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0F172A' } }}>
        <Stack.Screen name="UserMain" component={UserTabs} />
        <Stack.Screen name="History" component={ProfileListScreen} />
        <Stack.Screen name="ChartDetail" component={ChartDetailScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const [auth, setAuth] = useState({ isLoading: true, token: null, isAdmin: false });

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setAuth({ isLoading: false, token: null, isAdmin: false });
                return;
            }
            const profile = await axiosClient.get('/users/my-info');
            const isAdmin = profile.roles && profile.roles.some(r => r === 'ADMIN' || r.name === 'ADMIN');
            setAuth({ isLoading: false, token, isAdmin });
        } catch (error) {
            setAuth({ isLoading: false, token: null, isAdmin: false });
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    if (auth.isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FBBF24" />
            </View>
        );
    }

    return (
        <NotificationProvider>
            <NavigationContainer theme={{ dark: true, colors: { primary: '#FBBF24', background: '#0F172A', card: '#0F172A', text: '#F8FAFC', border: '#334155', notification: '#EF4444' } }}>
                {!auth.token ? (
                    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0F172A' } }}>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </Stack.Navigator>
                ) : auth.isAdmin ? (
                    <AdminStack />
                ) : (
                    <UserStack />
                )}
            </NavigationContainer>
        </NotificationProvider>
    );
};

export default AppNavigator;
