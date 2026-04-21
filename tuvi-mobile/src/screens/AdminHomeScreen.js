import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, FileText, AlertTriangle, LogOut, Settings, ChevronRight, Activity, ShieldCheck, ShoppingBag } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminHomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: '...', posts: '...', reports: '...' });
  const [profile, setProfile] = useState(null);

  const fetchData = async () => {
    try {
      // Gọi song song info và stats (stats tui hardcode placeholder hoặc API có sẵn)
      const profileData = await axiosClient.get('/users/my-info');
      setProfile(profileData);
      
      // Giả lập lấy dữ liệu thống kê nhanh
      setStats({
        users: '1.240',
        posts: '3.812',
        reports: '12'
      });
    } catch (error) {
      console.log('Admin Home Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await axiosClient.post('/auth/logout', { token });
      }
    } catch (error) {
      console.log('Admin Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

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
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Activity color="#38BDF8" size={20} />
              <Text style={styles.statValue} allowFontScaling={false}>{stats.users}</Text>
              <Text style={styles.statTitle} allowFontScaling={false}>Người dùng</Text>
            </View>
            <View style={styles.statBox}>
              <ShoppingBag color="#FBBF24" size={20} />
              <Text style={styles.statValue} allowFontScaling={false}>{stats.posts}</Text>
              <Text style={styles.statTitle} allowFontScaling={false}>Sản phẩm</Text>
            </View>
            <View style={styles.statBox}>
              <AlertTriangle color="#F43F5E" size={20} />
              <Text style={styles.statValue} allowFontScaling={false}>{stats.reports}</Text>
              <Text style={styles.statTitle} allowFontScaling={false}>Báo cáo</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader} allowFontScaling={false}>QUẢN LÝ HỆ THỐNG</Text>
            
            <ActionCard 
              icon={<Users color="#38BDF8" size={24} />}
              label="Danh sách Người dùng"
              description="Quản lý thông tin & quyền truy cập"
              color="#38BDF8"
              onPress={() => {}}
            />
            
            <ActionCard 
              icon={<ShoppingBag color="#FBBF24" size={24} />}
              label="Quản lý Cửa hàng"
              description="Quản lý sản phẩm & đơn hàng"
              color="#FBBF24"
              onPress={() => {}}
            />
            
            <ActionCard 
              icon={<AlertTriangle color="#F43F5E" size={24} />}
              label="Báo cáo & Vi phạm"
              description="Xử lý khiếu nại & báo cáo nội dung"
              color="#F43F5E"
              onPress={() => {}}
            />

            <ActionCard 
              icon={<Settings color="#94A3B8" size={24} />}
              label="Cấu hình Hệ thống"
              description="Chỉnh sửa các tham số ứng dụng"
              color="#94A3B8"
              onPress={() => {}}
            />
          </View>

          {/* Logout Section */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut color="#EF4444" size={20} />
              <Text style={styles.logoutText} allowFontScaling={false}>Đăng xuất khỏi trang quản trị</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  welcomeText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  adminName: { color: '#F8FAFC', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  scrollContent: { paddingHorizontal: 20 },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statBox: {
    width: '31%',
    backgroundColor: '#1E293B60',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  statTitle: { color: '#64748B', fontSize: 10, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' },
  section: { marginBottom: 32 },
  sectionHeader: { color: '#334155', fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 16, marginLeft: 8 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#1E293B',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: { flex: 1, marginLeft: 16 },
  actionLabel: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  actionDesc: { color: '#64748B', fontSize: 12, marginTop: 4 },
  footer: { marginTop: 10, alignItems: 'center', paddingBottom: 40 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
  version: { color: '#1E293B', fontSize: 11, marginTop: 24 },
});

export default AdminHomeScreen;
