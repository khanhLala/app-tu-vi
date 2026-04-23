import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Clock, 
  Package, 
  CreditCard,
  Hash,
  ShoppingBag,
  Copy,
  CheckCircle2,
  Truck,
  XCircle,
  AlertTriangle
} from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const AdminOrderDetailScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState(route.params.order);
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING': return { label: 'Chờ xác nhận', color: '#FBBF24', icon: <Clock color="#FBBF24" size={20} /> };
      case 'SHIPPING': return { label: 'Đang vận chuyển', color: '#818CF8', icon: <Truck color="#818CF8" size={20} /> };
      case 'DELIVERED': return { label: 'Đã giao hàng', color: '#8B5CF6', icon: <CheckCircle2 color="#8B5CF6" size={20} /> };
      case 'COMPLETED': return { label: 'Đã nhận hàng', color: '#10B981', icon: <CheckCircle2 color="#10B981" size={20} /> };
      case 'CANCELLED': return { label: 'Đã hủy đơn', color: '#F43F5E', icon: <XCircle color="#F43F5E" size={20} /> };
      default: return { label: status, color: '#64748B', icon: <Package color="#64748B" size={20} /> };
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(order.id);
    Alert.alert('Đã sao chép', 'Mã đơn hàng đã được lưu vào bộ nhớ tạm.');
  };

  const handleUpdateStatus = async (newStatus, title, message) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: async () => {
            setUpdating(true);
            try {
              const response = await axiosClient.put(`/admin/dashboard/orders/${order.id}/status?status=${newStatus}`);
              setOrder(response);
              Alert.alert('Thành công', `Đơn hàng đã được chuyển sang trạng thái: ${getStatusInfo(newStatus).label}`);
            } catch (error) {
              console.log('Update Status Error:', error);
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng.');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: `${statusInfo.color}20` }]}>
            {statusInfo.icon}
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>

          {/* Order Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Hash color="#FBBF24" size={18} />
              <Text style={styles.sectionTitle}>THÔNG TIN ĐƠN HÀNG</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
                <View style={styles.idContainer}>
                  <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                    {order.id}
                  </Text>
                  <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
                    <Copy color="#FBBF24" size={14} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày đặt:</Text>
                <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thanh toán:</Text>
                <Text style={styles.infoValue}>
                  {order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt (COD)'}
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin color="#FBBF24" size={18} />
              <Text style={styles.sectionTitle}>ĐỊA CHỈ NHẬN HÀNG</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.deliveryRow}>
                <Phone color="#64748B" size={16} />
                <Text style={styles.deliveryText}>{order.phone}</Text>
              </View>
              <View style={styles.deliveryRow}>
                <MapPin color="#64748B" size={16} />
                <Text style={styles.deliveryText}>{order.address}</Text>
              </View>
            </View>
          </View>

          {/* Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ShoppingBag color="#FBBF24" size={18} />
              <Text style={styles.sectionTitle}>DANH SÁCH SẢN PHẨM</Text>
            </View>
            {order.items.map((item, index) => (
              <View key={index} style={styles.productItem}>
                <Image source={{ uri: item.productImageUrl }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>{item.productName}</Text>
                  <View style={styles.priceQtyRow}>
                    <Text style={styles.productPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
                    <Text style={styles.productQty}>x{item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Summary Section */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalAmount}>{order.totalPrice.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons for Admin */}
        <View style={[styles.actionFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {updating ? (
            <ActivityIndicator color="#FBBF24" size="large" />
          ) : (
            <View style={styles.actionRow}>
              {order.status === 'PENDING' && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.cancelBtn]} 
                    onPress={() => handleUpdateStatus('CANCELLED', 'Hủy đơn hàng', 'Bạn có chắc chắn muốn hủy đơn hàng này?')}
                  >
                    <XCircle color="#F43F5E" size={20} />
                    <Text style={styles.cancelBtnText}>Hủy đơn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.confirmBtn]} 
                    onPress={() => handleUpdateStatus('SHIPPING', 'Xác nhận đơn', 'Chuyển đơn hàng sang trạng thái Đang giao hàng?')}
                  >
                    <CheckCircle2 color="#0F172A" size={20} />
                    <Text style={styles.confirmBtnText}>Xác nhận</Text>
                  </TouchableOpacity>
                </>
              )}

              {order.status === 'SHIPPING' && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.cancelBtn]} 
                    onPress={() => handleUpdateStatus('CANCELLED', 'Hủy đơn hàng', 'Bạn có chắc chắn muốn hủy đơn hàng đang giao này?')}
                  >
                    <XCircle color="#F43F5E" size={20} />
                    <Text style={styles.cancelBtnText}>Hủy đơn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.completeBtn]} 
                    onPress={() => handleUpdateStatus('DELIVERED', 'Giao hàng thành công', 'Xác nhận đơn hàng đã được giao thành công?')}
                  >
                    <Package color="#0F172A" size={20} />
                    <Text style={styles.completeBtnText}>Xác nhận đã giao</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
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
  scrollContent: { padding: 20, paddingBottom: 120 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 10,
    justifyContent: 'center',
  },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  infoCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  infoLabel: { color: '#94A3B8', fontSize: 14, flex: 1 },
  idContainer: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  infoValue: { color: '#F8FAFC', fontSize: 14, fontWeight: '500', textAlign: 'right', flex: 1 },
  copyBtn: { padding: 4, backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: 6 },
  deliveryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  deliveryText: { color: '#F8FAFC', fontSize: 14, flex: 1, lineHeight: 20 },
  productItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  productImage: { width: 60, height: 60, borderRadius: 12, marginRight: 16 },
  productDetails: { flex: 1, justifyContent: 'center' },
  productName: { color: '#F8FAFC', fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { color: '#FBBF24', fontSize: 14, fontWeight: 'bold' },
  productQty: { color: '#94A3B8', fontSize: 14 },
  totalSection: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  totalAmount: { color: '#FBBF24', fontSize: 24, fontWeight: 'bold' },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtn: { backgroundColor: '#FBBF24' },
  confirmBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { backgroundColor: 'rgba(244, 63, 94, 0.1)', borderWidth: 1, borderColor: '#F43F5E' },
  cancelBtnText: { color: '#F43F5E', fontWeight: 'bold', fontSize: 15 },
  completeBtn: { backgroundColor: '#10B981' },
  completeBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 },
});

export default AdminOrderDetailScreen;
