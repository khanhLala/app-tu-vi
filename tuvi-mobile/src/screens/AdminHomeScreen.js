import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  LogOut, 
  Settings, 
  ChevronRight, 
  Activity, 
  ShieldCheck, 
  ShoppingBag,
  TrendingUp,
  Package,
  DollarSign
} from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminHomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    newUsersToday: 0, 
    totalPosts: 0, 
    newPostsToday: 0, 
    totalRevenue: 0, 
    revenueToday: 0, 
    pendingReports: 0 
  });
  const [profile, setProfile] = useState(null);

  const formatCurrency = (val) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    }
    return val.toLocaleString('vi-VN') + 'đ';
  };

  const fetchData = async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        axiosClient.get('/users/my-info'),
        axiosClient.get('/admin/dashboard/stats')
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      console.log('Admin Home Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          navigation.replace('Login');
        }
      }
    ]);
  };

  const StatBox = ({ icon, value, title, todayValue, color, isCurrency, onPress }) => (
    <TouchableOpacity style={styles.statBox} onPress={onPress}>
      <View style={styles.statBoxHeader}>
        {icon}
        {todayValue > 0 && (
          <View style={[styles.todayBadge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.todayText, { color }]}>
              +{isCurrency ? formatCurrency(todayValue) : todayValue} hôm nay
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue} allowFontScaling={false} numberOfLines={1}>
        {isCurrency ? formatCurrency(value) : value}
      </Text>
      <Text style={styles.statTitle} allowFontScaling={false}>{title}</Text>
    </TouchableOpacity>
  );


  const ActionCard = ({ icon, label, description, color, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <View style={styles.actionInfo}>
        <Text style={styles.actionLabel} allowFontScaling={false}>{label}</Text>
        <Text style={styles.actionDesc} allowFontScaling={false}>{description}</Text>
      </View>
      <ChevronRight color="#334155" size={20} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FBBF24" size="large" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText} allowFontScaling={false}>Chào Quản trị viên,</Text>
            <Text style={styles.adminName} allowFontScaling={false}>{profile?.firstName || profile?.username || 'Admin'}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => {}}>
            <ShieldCheck color="#FBBF24" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
          }
        >
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatBox 
              icon={<Users color="#38BDF8" size={18} />} 
              value={stats.totalUsers} 
              title="Người dùng" 
              todayValue={stats.newUsersToday} 
              color="#38BDF8"
              onPress={() => navigation.navigate('UserManagement')}
            />
            <StatBox 
              icon={<FileText color="#FBBF24" size={18} />} 
              value={stats.totalPosts} 
              title="Bài viết" 
              todayValue={stats.newPostsToday} 
              color="#FBBF24"
              onPress={() => navigation.navigate('PostManagement', { initialTab: 'POSTS' })}
            />
            <StatBox 
              icon={<DollarSign color="#10B981" size={18} />} 
              value={stats.totalRevenue} 
              title="Doanh thu" 
              todayValue={stats.revenueToday}
              color="#10B981"
              isCurrency
              onPress={() => navigation.navigate('RevenueDetail', { 
                totalRevenue: stats.totalRevenue, 
                revenueToday: stats.revenueToday 
              })}
            />
            <StatBox 
              icon={<AlertTriangle color="#F43F5E" size={18} />} 
              value={stats.pendingReports} 
              title="Báo cáo mới" 
              color="#F43F5E"
              onPress={() => navigation.navigate('PostManagement', { initialTab: 'REPORTS' })}
            />
          </View>


          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader} allowFontScaling={false}>QUẢN LÝ HỆ THỐNG</Text>
            
            <ActionCard 
              icon={<Users color="#38BDF8" size={24} />}
              label="Danh sách Người dùng"
              description="Quản lý thông tin & quyền truy cập"
              color="#38BDF8"
              onPress={() => navigation.navigate('UserManagement')}
            />

            <ActionCard 
              icon={<ShoppingBag color="#818CF8" size={24} />}
              label="Quản lý Cửa hàng"
              description="Quản lý sản phẩm & đơn hàng"
              color="#818CF8"
              onPress={() => navigation.navigate('ShopManagement')}
            />

            <ActionCard 
              icon={<FileText color="#FBBF24" size={24} />}
              label="Quản lý Bài viết"
              description="Quản lý bài viết & xử lý báo cáo vi phạm"
              color="#FBBF24"
              onPress={() => navigation.navigate('PostManagement')}
            />
          </View>

          {/* Logout Section */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut color="#F43F5E" size={20} />
              <Text style={styles.logoutText} allowFontScaling={false}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  welcomeText: { color: '#94A3B8', fontSize: 14 },
  adminName: { color: '#F8FAFC', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statValue: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold' },
  statTitle: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  section: { marginTop: 10 },
  sectionHeader: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionInfo: { flex: 1 },
  actionLabel: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  actionDesc: { color: '#64748B', fontSize: 13, marginTop: 2 },
  footer: { marginTop: 30, alignItems: 'center' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  logoutText: { color: '#F43F5E', fontSize: 15, fontWeight: 'bold', marginLeft: 10 },
});

export default AdminHomeScreen;
