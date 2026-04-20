import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  FileText, 
  Compass, 
  DollarSign, 
  TrendingUp,
  MessageSquare,
  LogOut
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../../api/axiosClient';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get('/admin/stats');
      setStats(res);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    if (Platform.OS === 'web') {
        window.location.reload();
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subValue, subLabel }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon color={color} size={24} />
        </View>
        <TrendingUp color="#10B981" size={16} />
      </View>
      <Text style={styles.cardValue}>{value?.toLocaleString() || 0}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      {subValue !== undefined && (
        <View style={styles.subInfo}>
          <Text style={styles.subValue}>+{subValue}</Text>
          <Text style={styles.subLabel}>{subLabel}</Text>
        </View>
      )}
    </View>
  );

  const MenuBtn = ({ title, icon: Icon, onPress, color }) => (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={24} />
      </View>
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut color="#EF4444" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QUẢN TRỊ HỆ THỐNG</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FBBF24" />
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
            }
          >
            <Text style={styles.sectionTitle}>Tổng quan dữ liệu</Text>
            <View style={styles.statsGrid}>
              <StatCard 
                title="Tổng Người Dùng" 
                value={stats?.totalUsers} 
                icon={Users} 
                color="#3B82F6" 
                subValue={stats?.newUsersToday}
                subLabel="hôm nay"
              />
              <StatCard 
                title="Bài Viết Cộng Đồng" 
                value={stats?.totalPosts} 
                icon={MessageSquare} 
                color="#8B5CF6" 
                subValue={stats?.newPostsToday}
                subLabel="hôm nay"
              />
              <StatCard 
                title="Lá Số Đã Lập" 
                value={stats?.totalCharts} 
                icon={Compass} 
                color="#F59E0B" 
              />
              <StatCard 
                title="Tổng Doanh Thu" 
                value={stats?.totalRevenue} 
                icon={DollarSign} 
                color="#10B981" 
                subLabel="VNĐ"
              />
            </View>

            <View style={styles.menuGrid}>
              <MenuBtn 
                title="Quản lý Người dùng" 
                icon={Users} 
                color="#3B82F6" 
                onPress={() => navigation.navigate('AdminUsers')} 
              />
              <MenuBtn 
                title="Quản lý Báo cáo" 
                icon={FileText} 
                color="#EF4444" 
                onPress={() => navigation.navigate('AdminReports')} 
              />
              <MenuBtn 
                title="Quản lý Sản phẩm" 
                icon={Compass} 
                color="#F59E0B" 
                onPress={() => navigation.navigate('AdminProducts')} 
              />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  headerTitle: { color: '#FBBF24', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  sectionTitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold', marginBottom: 15, marginTop: 10, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    width: '48%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconContainer: { padding: 10, borderRadius: 12 },
  cardValue: { color: '#F8FAFC', fontSize: 24, fontWeight: 'bold' },
  cardTitle: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  subInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  subValue: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  subLabel: { color: '#64748B', fontSize: 11, marginLeft: 4 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 },
  menuBtn: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    marginBottom: 8,
  },
  menuIcon: { padding: 10, borderRadius: 12, marginRight: 16 },
  menuText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
});

export default AdminDashboardScreen;
