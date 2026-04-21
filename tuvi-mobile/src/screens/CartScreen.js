import React, { useEffect } from 'react';
import {
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react-native';
import { useCart } from '../context/CartContext';

const CartScreen = ({ navigation }) => {
  const { cartItems, fetchCart, removeFromCart } = useCart();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const load = async () => {
      await fetchCart();
      setLoading(false);
    };
    load();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);

  const handleRemove = (cartItemId) => {
    Alert.alert('Xóa sản phẩm', 'Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: () => removeFromCart(cartItemId),
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.productImageUrl ? (
        <Image source={{ uri: item.productImageUrl }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.imagePlaceholder]}>
          <ShoppingCart color="#64748B" size={20} />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2} allowFontScaling={false}>{item.productName}</Text>
        <Text style={styles.itemPrice} allowFontScaling={false}>
          {Number(item.productPrice).toLocaleString('vi-VN')}đ
        </Text>
        <Text style={styles.itemQty} allowFontScaling={false}>Số lượng: {item.quantity}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.deleteBtn}>
        <Trash2 color="#EF4444" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#F8FAFC" size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} allowFontScaling={false}>Giỏ Hàng</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#FBBF24" size="large" style={{ marginTop: 80 }} />
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingCart color="#334155" size={64} />
            <Text style={styles.emptyTitle} allowFontScaling={false}>Giỏ hàng trống</Text>
            <Text style={styles.emptySubtitle} allowFontScaling={false}>Hãy thêm sản phẩm bạn yêu thích vào giỏ</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.browseBtnText} allowFontScaling={false}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
            {/* Total & Checkout */}
            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel} allowFontScaling={false}>Tổng cộng</Text>
                <Text style={styles.totalValue} allowFontScaling={false}>
                  {total.toLocaleString('vi-VN')}đ
                </Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => Alert.alert('Thông báo', 'Chức năng thanh toán đang được phát triển!')}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#FBBF24', '#F59E0B']} style={styles.checkoutGradient}>
                  <Text style={styles.checkoutText} allowFontScaling={false}>Thanh Toán</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#334155',
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 16, paddingBottom: 20 },
  cartItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: 14, padding: 12,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: '#334155', overflow: 'hidden',
  },
  itemImage: { width: 72, height: 72, borderRadius: 10, resizeMode: 'cover' },
  imagePlaceholder: { backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, paddingHorizontal: 12 },
  itemName: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemPrice: { color: '#FBBF24', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  itemQty: { color: '#64748B', fontSize: 13 },
  deleteBtn: { padding: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { color: '#64748B', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  browseBtn: {
    borderWidth: 1.5, borderColor: '#FBBF24', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  browseBtnText: { color: '#FBBF24', fontSize: 15, fontWeight: '600' },
  footer: {
    borderTopWidth: 0.5, borderTopColor: '#334155',
    backgroundColor: '#0F172A', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  totalLabel: { color: '#94A3B8', fontSize: 15 },
  totalValue: { color: '#F8FAFC', fontSize: 22, fontWeight: 'bold' },
  checkoutBtn: { borderRadius: 14, overflow: 'hidden' },
  checkoutGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  checkoutText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default CartScreen;
