import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Clock, User, ChevronRight, Hash } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const ProductOrdersScreen = ({ navigation, route }) => {
  const { productId, productName } = route.params;
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axiosClient.get(`/admin/dashboard/product-orders/${productId}`);
      setOrders(response);
    } catch (error) {
      console.log('Product Orders Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10B981';
      case 'PENDING': return '#FBBF24';

      case 'SHIPPING': return '#818CF8';
      case 'CANCELLED': return '#F43F5E';
      default: return '#64748B';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';

      case 'SHIPPING': return 'Đang giao hàng';
      case 'COMPLETED': return 'Đã giao';
      case 'CANCELLED': return 'Đã hủy đơn';
      default: return status;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => navigation.navigate('AdminOrderDetail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdBox}>
          <Hash color="#94A3B8" size={14} />
          <Text style={styles.orderId}>{item.id.substring(0, 8).toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      
      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Clock color="#64748B" size={14} />
          <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.priceText}>{item.totalPrice.toLocaleString('vi-VN')}đ</Text>
      </View>
      <ChevronRight color="#334155" size={18} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Đơn hàng vật phẩm</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{productName}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <ActivityIndicator color="#FBBF24" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Chưa có đơn hàng nào cho sản phẩm này</Text>
              </View>
            }
          />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitleBox: { flex: 1 },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  listContent: { padding: 20 },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  orderHeader: { flex: 1 },
  orderIdBox: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  orderId: { color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  orderInfo: { alignItems: 'flex-end', marginRight: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  infoText: { color: '#64748B', fontSize: 12 },
  priceText: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#64748B' },
});

export default ProductOrdersScreen;
