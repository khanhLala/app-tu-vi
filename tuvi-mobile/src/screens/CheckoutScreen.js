import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Phone, CreditCard, Truck, CheckCircle } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useCart } from '../context/CartContext';
import orderApi from '../api/orderApi';
import axiosClient from '../api/axiosClient';

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, cartCount, fetchCart } = useCart();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    // Pre-fill user info if available
    const fetchUser = async () => {
      try {
        const response = await axiosClient.get('users/my-info');
        if (response.data?.result) {
          const user = response.data.result;
          if (user.address) setAddress(user.address);
          if (user.phone) setPhone(user.phone);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchUser();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);

  const handleGetLocation = async () => {
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Ứng dụng cần quyền truy cập vị trí để lấy địa chỉ của bạn.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverse.length > 0) {
        const loc = reverse[0];
        const addressStr = `${loc.name || ''} ${loc.street || ''}, ${loc.district || ''}, ${loc.subregion || ''}, ${loc.region || ''}`.replace(/, ,/g, ',').trim();
        setAddress(addressStr);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng nhập tay.');
    } finally {
      setLocating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim() || !phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ địa chỉ và số điện thoại.');
      return;
    }

    setLoading(true);
    try {
      const result = await orderApi.createOrder({
        address,
        phone,
        paymentMethod,
      });
      await fetchCart(); // Clear cart in state
      
      if (result.paymentUrl) {
        navigation.navigate('VietQRPayment', { 
          order: result,
          paymentUrl: result.paymentUrl 
        });
      } else {
        navigation.navigate('OrderSuccess');
      }
    } catch (e) {
      Alert.alert('Lỗi', e.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#F8FAFC" size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} allowFontScaling={false}>Xác nhận đơn hàng</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Items Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle} allowFontScaling={false}>Vật phẩm ({cartCount})</Text>
            {cartItems.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.itemPrice}>x{item.quantity}  {Number(item.productPrice * item.quantity).toLocaleString('vi-VN')}đ</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.shippingBadge}>
              <Truck size={14} color="#10B981" />
              <Text style={styles.shippingText}>Miễn phí giao hàng (Freeship)</Text>
            </View>
          </View>

          {/* Shipping Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} allowFontScaling={false}>Thông tin giao hàng</Text>
              <TouchableOpacity onPress={handleGetLocation} style={styles.gpsBtn} disabled={locating}>
                {locating ? (
                  <ActivityIndicator size="small" color="#FBBF24" />
                ) : (
                  <>
                    <MapPin size={14} color="#FBBF24" />
                    <Text style={styles.gpsBtnText}>Lấy vị trí</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Phone size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                placeholderTextColor="#64748B"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <MapPin size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Địa chỉ nhận hàng"
                placeholderTextColor="#64748B"
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle} allowFontScaling={false}>Phương thức thanh toán</Text>
            
            <TouchableOpacity 
              style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('COD')}
            >
              <View style={styles.paymentIconContainer}>
                <Truck size={20} color={paymentMethod === 'COD' ? '#0F172A' : '#94A3B8'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.paymentName, paymentMethod === 'COD' && styles.paymentNameActive]}>Thanh toán khi nhận hàng (COD)</Text>
                <Text style={styles.paymentDesc}>Trả tiền khi shipper giao hàng</Text>
              </View>
              {paymentMethod === 'COD' && <CheckCircle size={20} color="#0F172A" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentOption, paymentMethod === 'BANK_TRANSFER' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('BANK_TRANSFER')}
            >
              <View style={styles.paymentIconContainer}>
                <CreditCard size={20} color={paymentMethod === 'BANK_TRANSFER' ? '#0F172A' : '#94A3B8'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.paymentName, paymentMethod === 'BANK_TRANSFER' && styles.paymentNameActive]}>Chuyển khoản VietQR</Text>
                <Text style={styles.paymentDesc}>Quét mã giao thông TPBank thật</Text>
              </View>
              {paymentMethod === 'BANK_TRANSFER' && <CheckCircle size={20} color="#0F172A" />}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.orderBtn, loading && { opacity: 0.7 }]}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            <LinearGradient colors={['#FBBF24', '#F59E0B']} style={styles.orderGradient}>
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.orderBtnText}>XÁC NHẬN ĐẶT HÀNG</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  scrollContent: { padding: 16, paddingBottom: 100 },
  section: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { color: '#94A3B8', fontSize: 14, flex: 1 },
  itemPrice: { color: '#CBD5E1', fontSize: 14, marginLeft: 10 },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#FBBF24', fontSize: 20, fontWeight: 'bold' },
  shippingBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  shippingText: { color: '#10B981', fontSize: 13, fontWeight: '500' },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  gpsBtnText: { color: '#FBBF24', fontSize: 12, fontWeight: 'bold' },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#334155',
  },
  inputIcon: { marginLeft: 12 },
  input: { flex: 1, color: '#F8FAFC', padding: 12, fontSize: 15 },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderRadius: 12, padding: 12,
    marginBottom: 10, borderWidth: 1, borderColor: '#334155', gap: 12,
  },
  paymentOptionActive: { backgroundColor: '#FBBF24', borderColor: '#FBBF24' },
  paymentIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(148, 163, 184, 0.1)', alignItems: 'center', justifyContent: 'center' },
  paymentName: { color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' },
  paymentNameActive: { color: '#0F172A' },
  paymentDesc: { color: '#64748B', fontSize: 12 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0F172A', padding: 20, borderTopWidth: 0.5, borderTopColor: '#334155',
  },
  orderBtn: { borderRadius: 14, overflow: 'hidden' },
  orderGradient: { paddingVertical: 16, alignItems: 'center' },
  orderBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default CheckoutScreen;
