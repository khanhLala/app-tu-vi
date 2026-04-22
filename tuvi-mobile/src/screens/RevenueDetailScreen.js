import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign,
  Package,
  ChevronRight
} from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const RevenueDetailScreen = ({ navigation, route }) => {
  const { totalRevenue: initialTotal, revenueToday: initialToday } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueStats, setRevenueStats] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: initialTotal || 0,
    revenueToday: initialToday || 0
  });

  const formatCurrency = (val) => {
    return val.toLocaleString('vi-VN') + 'đ';
  };

  const fetchData = async () => {
    try {
      const [statsRes, dashboardRes] = await Promise.all([
        axiosClient.get('/admin/dashboard/product-revenue'),
        axiosClient.get('/admin/dashboard/stats')
      ]);
      setRevenueStats(statsRes);
      setSummary({
        totalRevenue: dashboardRes.totalRevenue,
        revenueToday: dashboardRes.revenueToday
      });
    } catch (error) {
      console.log('Revenue Detail Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductOrders', { 
        productId: item.productId, 
        productName: item.productName 
      })}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
        <View style={styles.revenueRow}>
          <TrendingUp color="#10B981" size={14} />
          <Text style={styles.revenueValue}>{formatCurrency(item.revenue)}</Text>
        </View>
      </View>
      <View style={styles.percentageBox}>
        <Text style={styles.percentageText}>
          {summary.revenueToday > 0 ? ((item.revenue / summary.revenueToday) * 100).toFixed(1) : 0}%
        </Text>
      </View>
      <ChevronRight color="#334155" size={16} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết Doanh thu</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryBox, { borderColor: '#10B98130' }]}>
            <DollarSign color="#10B981" size={20} />
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalRevenue)}</Text>
            <Text style={styles.summaryLabel}>Tổng doanh thu</Text>
          </View>
          <View style={[styles.summaryBox, { borderColor: '#38BDF830' }]}>
            <TrendingUp color="#38BDF8" size={20} />
            <Text style={styles.summaryValue}>{formatCurrency(summary.revenueToday)}</Text>
            <Text style={styles.summaryLabel}>Doanh thu hôm nay</Text>
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>BXH DOANH THU HÔM NAY</Text>
          {loading ? (
            <ActivityIndicator color="#FBBF24" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={revenueStats}
              renderItem={renderItem}
              keyExtractor={item => item.productId}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
              }
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Package color="#334155" size={48} />
                  <Text style={styles.emptyText}>Chưa có doanh thu hôm nay</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  summaryValue: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginVertical: 6 },
  summaryLabel: { color: '#64748B', fontSize: 12 },
  listSection: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 },
  listContent: { paddingBottom: 20 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold' },
  productImage: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { color: '#F8FAFC', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  revenueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  revenueValue: { color: '#10B981', fontSize: 14, fontWeight: 'bold' },
  percentageBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  percentageText: { color: '#10B981', fontSize: 11, fontWeight: 'bold' },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#64748B', marginTop: 12, fontSize: 14 },
});

export default RevenueDetailScreen;
