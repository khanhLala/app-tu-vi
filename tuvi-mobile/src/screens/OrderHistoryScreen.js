import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Box, Calendar, ChevronRight, Clock, XCircle, CreditCard, Truck, CheckCircle2, Star } from 'lucide-react-native';
import orderApi from '../api/orderApi';

const STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chưa xác nhận' },
  { id: 'SHIPPING', label: 'Đang giao' },
  { id: 'COMPLETED', label: 'Đã nhận' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('ALL');

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderApi.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Fetch orders error:', e);
      Alert.alert('Lỗi', 'Không thể tải lịch sử đơn hàng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (selectedTab === 'ALL') return orders;
    if (selectedTab === 'PENDING') {
      return orders.filter(o => o.status === 'PENDING');
    }

    return orders.filter(o => o.status === selectedTab);
  }, [orders, selectedTab]);

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        { text: 'Bỏ qua', style: 'cancel' },
        { 
          text: 'Xác nhận hủy', 
          style: 'destructive',
          onPress: async () => {
            try {
              await orderApi.cancelOrder(orderId);
              Alert.alert('Thành công', 'Đơn hàng đã được hủy.');
              fetchOrders();
            } catch (e) {
              Alert.alert('Lỗi', e.message || 'Không thể hủy đơn hàng.');
            }
          }
        }
      ]
    );
  };

  const handleCompleteOrder = (orderId) => {
    Alert.alert(
      'Xác nhận đã nhận hàng',
      'Xác nhận bạn đã nhận được gói hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: async () => {
            try {
              await orderApi.completeOrder(orderId);
              Alert.alert('Thành công', 'Đơn hàng đã được hoàn thành. Bạn có thể đánh giá sản phẩm ngay bây giờ.');
              fetchOrders();
            } catch (e) {
              Alert.alert('Lỗi', e.message || 'Không thể cập nhật đơn hàng.');
            }
          }
        }
      ]
    );
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING': return { label: 'Chờ xác nhận', color: '#FBBF24', icon: <Clock size={14} color="#FBBF24" /> };

      case 'SHIPPING': return { label: 'Đang giao hàng', color: '#3B82F6', icon: <Truck size={14} color="#3B82F6" /> };
      case 'COMPLETED': return { label: 'Đã hoàn thành', color: '#10B981', icon: <CheckCircle2 size={14} color="#10B981" /> };
      case 'CANCELLED': return { label: 'Đã hủy', color: '#EF4444', icon: <XCircle size={14} color="#EF4444" /> };
      default: return { label: status, color: '#94A3B8', icon: <Box size={14} color="#94A3B8" /> };
    }
  };

  const renderOrderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const date = new Date(item.createdAt).toLocaleDateString('vi-VN');
    const canCancel = item.status === 'PENDING';


    return (
      <View style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
            <Text style={styles.orderIdLabel}>Mã đơn:</Text>
            <Text style={styles.orderIdValue}>#{item.id.substring(0, 8).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            {statusInfo.icon}
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.infoText}>{date}</Text>
          </View>
          
          <View style={styles.itemsList}>
            {item.items.map((orderItem, idx) => (
              <View key={idx} style={styles.itemRowWrapper}>
                <View style={styles.itemMainInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{orderItem.productName}</Text>
                  <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
                </View>
                {item.status === 'COMPLETED' && (
                  <TouchableOpacity 
                    style={[
                      styles.reviewItemBtn, 
                      orderItem.isReviewed && styles.reviewedBtn
                    ]}
                    onPress={() => navigation.navigate('Review', { 
                      productId: orderItem.productId, 
                      productName: orderItem.productName,
                      orderId: item.id
                    })}
                    disabled={orderItem.isReviewed}
                  >
                    <Star 
                      size={12} 
                      color={orderItem.isReviewed ? "#94A3B8" : "#0F172A"} 
                      fill={orderItem.isReviewed ? "#94A3B8" : "#0F172A"} 
                    />
                    <Text style={[
                      styles.reviewItemBtnText,
                      orderItem.isReviewed && styles.reviewedBtnText
                    ]}>
                      {orderItem.isReviewed ? 'Đã đánh giá' : 'Đánh giá'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue}>{Number(item.totalPrice).toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }}>
            {canCancel && (
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => handleCancelOrder(item.id)}
              >
                <Text style={styles.cancelBtnText}>Hủy đơn</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
              <TouchableOpacity 
                style={styles.completeBtn}
                onPress={() => handleCompleteOrder(item.id)}
              >
                <Text style={styles.completeBtnText}>Đã nhận hàng</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.detailBtn}
            onPress={() => navigation.navigate('OrderDetail', { order: item })}
          >
            <Text style={styles.detailBtnText}>Chi tiết đơn</Text>
            <ChevronRight size={16} color="#FBBF24" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#F8FAFC" size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
            {STATUS_TABS.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, selectedTab === tab.id && styles.activeTab]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[styles.tabLabel, selectedTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#FBBF24" size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={item => item.id}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor="#FBBF24" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Box size={60} color="#334155" />
                <Text style={styles.emptyText}>Chưa có đơn hàng nào trong mục này</Text>
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
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#334155',
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  tabBar: { backgroundColor: '#0F172A', borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  tabContent: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  tabItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(30, 41, 59, 0.5)' },
  activeTab: { backgroundColor: '#FBBF24' },
  tabLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  activeTabLabel: { color: '#0F172A' },
  listContent: { padding: 16, paddingBottom: 80 },
  orderCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#334155', overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#334155',
  },
  idGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderIdLabel: { color: '#64748B', fontSize: 12 },
  orderIdValue: { color: '#FBBF24', fontSize: 13, fontWeight: 'bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  cardBody: { padding: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  infoText: { color: '#94A3B8', fontSize: 13 },
  itemsList: { marginBottom: 12, gap: 8 },
  itemRowWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemMainInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemName: { color: '#CBD5E1', fontSize: 14, flex: 1 },
  itemQty: { color: '#64748B', fontSize: 12 },
  reviewItemBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, 
    backgroundColor: '#FBBF24', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 
  },
  reviewItemBtnText: { color: '#0F172A', fontSize: 11, fontWeight: 'bold' },
  reviewedBtn: { backgroundColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 1, borderColor: '#334155' },
  reviewedBtnText: { color: '#94A3B8' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#F8FAFC', fontSize: 14 },
  totalValue: { color: '#FBBF24', fontSize: 16, fontWeight: 'bold' },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, backgroundColor: 'rgba(15, 23, 42, 0.5)', gap: 12,
  },
  cancelBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444' },
  cancelBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '500' },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailBtnText: { color: '#FBBF24', fontSize: 13, fontWeight: '500' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, opacity: 0.5 },
  emptyText: { color: '#94A3B8', fontSize: 15, marginTop: 16, textAlign: 'center' },
});

export default OrderHistoryScreen;
