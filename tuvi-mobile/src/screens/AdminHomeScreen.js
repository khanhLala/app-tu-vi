import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, FileText, AlertTriangle, LogOut, Settings, ChevronRight, Activity, ShieldCheck, ShoppingBag, Package, MessageSquare, Plus } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminHomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);

  const formatNumber = (num) => {
    return num?.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') || '0';
  };

  const fetchData = async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        axiosClient.get('/users/my-info'),
        axiosClient.get('/stats/summary')
      ]);
      setProfile(profileData);
      setStats(statsData);
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
          <TouchableOpacity style={styles.profileBtn} onPress={() => { }}>
            <ShieldCheck color="#FBBF24" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <View style={styles.statHeader}>
                  <Users color="#38BDF8" size={18} />
                  <View style={styles.todayBadge}>
                    <Plus color="#38BDF8" size={10} />
                    <Text style={styles.todayValue}>{formatNumber(stats?.userStats?.today)}</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>{formatNumber(stats?.userStats?.total)}</Text>
                <Text style={styles.statTitle}>Người dùng</Text>
              </View>

              <View style={styles.statBox}>
                <View style={styles.statHeader}>
                  <Package color="#FBBF24" size={18} />
                  <View style={styles.todayBadge}>
                    <Plus color="#FBBF24" size={10} />
                    <Text style={[styles.todayValue, { color: '#FBBF24' }]}>{formatNumber(stats?.productStats?.today)}</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>{formatNumber(stats?.productStats?.total)}</Text>
                <Text style={styles.statTitle}>Vật phẩm</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <View style={styles.statHeader}>
                  <FileText color="#A855F7" size={18} />
                  <View style={styles.todayBadge}>
                    <Plus color="#A855F7" size={10} />
                    <Text style={[styles.todayValue, { color: '#A855F7' }]}>{formatNumber(stats?.tuViStats?.today)}</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>{formatNumber(stats?.tuViStats?.total)}</Text>
                <Text style={styles.statTitle}>Lá số</Text>
              </View>

              <View style={styles.statBox}>
                <View style={styles.statHeader}>
                  <MessageSquare color="#10B981" size={18} />
                  <View style={styles.todayBadge}>
                    <Plus color="#10B981" size={10} />
                    <Text style={[styles.todayValue, { color: '#10B981' }]}>{formatNumber(stats?.postStats?.today)}</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>{formatNumber(stats?.postStats?.total)}</Text>
                <Text style={styles.statTitle}>Bài viết</Text>
              </View>
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
              onPress={() => navigation.navigate('UserManagement')}
            />

            <ActionCard
              icon={<ShoppingBag color="#FBBF24" size={24} />}
              label="Quản lý Cửa hàng"
              description="Quản lý sản phẩm & đơn hàng"
              color="#FBBF24"
              onPress={() => { }}
            />

            <ActionCard
              icon={<AlertTriangle color="#F43F5E" size={24} />}
              label="Báo cáo & Vi phạm"
              description="Xử lý khiếu nại & báo cáo nội dung"
              color="#F43F5E"
              onPress={() => { }}
            />

            <ActionCard
              icon={<Settings color="#94A3B8" size={24} />}
              label="Cấu hình Hệ thống"
              description="Chỉnh sửa các tham số ứng dụng"
              color="#94A3B8"
              onPress={() => { }}
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
    marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    width: '48.5%',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  todayValue: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 2,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
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
