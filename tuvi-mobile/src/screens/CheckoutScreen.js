import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Phone, CreditCard, Truck, CheckCircle } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useCart } from '../context/CartContext';
import orderApi from '../api/orderApi';
import axiosClient from '../api/axiosClient';

const CheckoutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert('Lỗi', 'Vui lòng bật dịch vụ định vị (GPS) trên thiết bị của bạn.');
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Ứng dụng cần quyền truy cập vị trí để lấy địa chỉ của bạn.');
        return;
      }

      console.log('>>> Thử lấy tọa độ...');
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      console.log('>>> Đã có tọa độ:', latitude, longitude);

      let addressStr = '';

      // Bước 4: Thử dịch ngược bằng dịch vụ Native của máy
      try {
        console.log('>>> Thử dịch ngược bằng Native Geocoder...');
        let reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          const loc = reverse[0];
          addressStr = [loc.name, loc.street, loc.district, loc.subregion, loc.region]
            .filter(item => item && item !== 'Unnamed Road').join(', ');
        }
      } catch (nativeError) {
        console.log('>>> Native Geocoder lỗi, thử dùng API dự phòng (Nominatim)...');
        // Bước 5: Fallback sang OpenStreetMap (Nominatim) nếu Native bị lỗi NullPointer
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'TuViApp/1.0' } }
          );
          const data = await response.json();
          if (data && data.display_name) {
            addressStr = data.display_name;
            console.log('>>> Lấy địa chỉ từ Nominatim thành công!');
          }
        } catch (fallbackError) {
          console.error('>>> Cả 2 cách đều lỗi:', fallbackError);
        }
      }

      if (addressStr) {
        setAddress(addressStr);
      } else {
        setAddress(`${latitude}, ${longitude}`);
        Alert.alert('Thông báo', 'Đã lấy được tọa độ nhưng không tìm thấy tên đường. Vui lòng nhập tay.');
      }
    } catch (e) {
      console.error('Lỗi tổng quan lấy vị trí:', e);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng kiểm tra lại GPS.');
    } finally {
      setLocating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim() || !phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ địa chỉ và số điện thoại.');
      return;
    }

    // Phone number validation (Vietnam format)
    const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ''))) {
      Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại hợp lệ');
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
              <Text style={styles.shippingText}>Miễn phí giao hàng</Text>
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
              </View>
              {paymentMethod === 'BANK_TRANSFER' && <CheckCircle size={20} color="#0F172A" />}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
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
  scrollContent: { padding: 16, paddingBottom: 140 },
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
