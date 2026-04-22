import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Compass, Sparkles, User, History as HistoryIcon, ShoppingBag, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackHandler, Text } from 'react-native';
import { useNavigationState } from '@react-navigation/native';

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
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import VietQRPaymentScreen from '../screens/VietQRPaymentScreen';
import ReviewScreen from '../screens/ReviewScreen';
import ChatScreen from '../screens/ChatScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Cấu hình Tab chính của ứng dụng
const MainTabs = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [tabHistory, setTabHistory] = React.useState(['Calculate']);

  // Theo dõi tab hiện tại
  const currentTab = useNavigationState(s => {
    const route = s.routes[s.index];
    if (route.state) {
      return route.state.routes[route.state.index].name;
    }
    return route.name === 'Main' ? 'Calculate' : route.name;
  });

  // Cập nhật lịch sử khi tab thay đổi
  React.useEffect(() => {
    if (currentTab) {
      setTabHistory(prev => {
        if (prev[prev.length - 1] === currentTab) return prev;
        return [...prev, currentTab];
      });
    }
  }, [currentTab]);

  // Xử lý nút Back của Android
  React.useEffect(() => {
    const backAction = () => {
      if (tabHistory.length > 1) {
        const newHistory = [...tabHistory];
        newHistory.pop(); // Bỏ tab hiện tại
        const prevTab = newHistory[newHistory.length - 1];
        setTabHistory(newHistory);
        navigation.navigate('Main', { screen: prevTab });
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [tabHistory, navigation]);

  return (
    <Tab.Navigator
      backBehavior="none"
      sceneContainerStyle={{ backgroundColor: '#0F172A' }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#334155',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          marginBottom: 4,
        },
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#FBBF24',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen
        name="Calculate"
        component={CreateChartScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 11, fontWeight: 'bold', marginBottom: 4 }} allowFontScaling={false}>Lập lá số</Text>,
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 11, fontWeight: 'bold', marginBottom: 4 }} allowFontScaling={false}>Cửa hàng</Text>,
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialFeedScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 11, fontWeight: 'bold', marginBottom: 4 }} allowFontScaling={false}>Cộng đồng</Text>,
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 11, fontWeight: 'bold', marginBottom: 4 }} allowFontScaling={false}>Cài đặt</Text>,
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

const MyTheme = {
  dark: true,
  colors: {
    primary: '#FBBF24',
    background: '#0F172A',
    card: '#0F172A',
    text: '#F8FAFC',
    border: '#334155',
    notification: '#EF4444',
  },
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
