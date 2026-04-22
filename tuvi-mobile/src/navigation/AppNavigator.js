import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';

// Screens
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
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import VietQRPaymentScreen from '../screens/VietQRPaymentScreen';
import ReviewScreen from '../screens/ReviewScreen';
import ChatScreen from '../screens/ChatScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import UserManagementScreen from '../screens/UserManagementScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUserManagerScreen from '../screens/admin/AdminUserManagerScreen';
import AdminReportManagerScreen from '../screens/admin/AdminReportManagerScreen';
import AdminProductManagerScreen from '../screens/admin/AdminProductManagerScreen';

// Context & Icons
import { NotificationProvider, useNotifications } from '../context/NotificationContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import * as LucideWeb from 'lucide-react';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- COMPONENTS ---

const TabIcon = ({ name, color, size }) => {
    if (Platform.OS === 'web') {
        const IconComponent = LucideWeb[name];
        return IconComponent ? <IconComponent color={color} size={size} /> : null;
    }

    try {
        const LucideNative = require('lucide-react-native');
        const IconComponent = LucideNative[name];
        return IconComponent ? <IconComponent color={color} size={size} /> : null;
    } catch (e) {
        return null;
    }
};

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

const AppNavigator = () => {
    return (
        <NavigationContainer theme={MyTheme}>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#0F172A' },
                    detachPreviousScreen: false, // Giữ màn hình cũ để tránh chớp trắng khi back
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="AdminMain" component={AdminHomeScreen} />
                <Stack.Screen name="History" component={ProfileListScreen} />
                <Stack.Screen name="ChartDetail" component={ChartDetailScreen} />
                <Stack.Screen name="Security" component={SecurityScreen} />
                <Stack.Screen name="Support" component={SupportScreen} />
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
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="Cart" component={CartScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />
                <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
                <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                <Stack.Screen name="VietQRPayment" component={VietQRPaymentScreen} />
                <Stack.Screen name="Review" component={ReviewScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
