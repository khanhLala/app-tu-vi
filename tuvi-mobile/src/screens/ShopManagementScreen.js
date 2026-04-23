import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShoppingBag,
  Package,
  ClipboardList,
  Plus,
  Search,
  ChevronRight,
  Edit3,
  Trash2,
  ArrowLeft,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const { width } = Dimensions.get('window');

const ORDER_STATUSES = [
  { id: 'PENDING', label: 'Chờ xác nhận', icon: Clock, color: '#FBBF24' },
  { id: 'SHIPPING', label: 'Đang vận chuyển', icon: Truck, color: '#818CF8' },
  { id: 'DELIVERED', label: 'Đã giao hàng', icon: CheckCircle2, color: '#8B5CF6' },
  { id: 'COMPLETED', label: 'Đã nhận hàng', icon: CheckCircle2, color: '#10B981' },
  { id: 'CANCELLED', label: 'Đã hủy', icon: XCircle, color: '#F43F5E' },
];

const ShopManagementScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [mainTab, setMainTab] = useState('PRODUCTS');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderStatus, setOrderStatus] = useState('PENDING');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (mainTab === 'PRODUCTS') {
        const result = await axiosClient.get('/products');
        setProducts(result);
        setFilteredProducts(result);
      } else {
        const result = await axiosClient.get(`/admin/dashboard/orders?status=${orderStatus}`);
        setOrders(result);
      }
    } catch (error) {
      console.log('Fetch Shop Error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu cửa hàng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, mainTab, orderStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [mainTab, orderStatus]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(text.toLowerCase()) ||
        p.category?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleDeleteProduct = (id) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosClient.delete(`/products/${id}`);
              Alert.alert('Thành công', 'Sản phẩm đã được xóa.');
              fetchData();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
            }
          }
        }
      ]
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category || 'Chưa phân loại'}</Text>
        <Text style={styles.productPrice}>{item.price.toLocaleString()}đ</Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('ProductEdit', { product: item })}
        >
          <Edit3 color="#FBBF24" size={18} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Trash2 color="#F43F5E" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('AdminOrderDetail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdBox}>
          <Hash color="#94A3B8" size={14} />
          <Text style={styles.orderId}>{item.id.substring(0, 8).toUpperCase()}</Text>
        </View>
        <Text style={styles.orderTime}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerPhone}>{item.phone}</Text>
          <Text style={styles.customerAddress} numberOfLines={1}>{item.address}</Text>
        </View>
        <Text style={styles.orderPrice}>{item.totalPrice.toLocaleString()}đ</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.itemCount}>{item.items?.length || 0} sản phẩm</Text>
        <ChevronRight color="#334155" size={16} />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} allowFontScaling={false}>Quản lý Cửa hàng</Text>
          {mainTab === 'PRODUCTS' ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('ProductEdit')}
            >
              <Plus color="#0F172A" size={20} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Order Status Filters */}
        {mainTab === 'ORDERS' && (
          <View style={styles.filterSection}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={ORDER_STATUSES}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => {
                const Icon = item.icon;
                const isActive = orderStatus === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.filterItem, isActive && { backgroundColor: item.color + '20', borderColor: item.color }]}
                    onPress={() => setOrderStatus(item.id)}
                  >
                    <Icon color={isActive ? item.color : '#64748B'} size={16} />
                    <Text style={[styles.filterLabel, isActive && { color: item.color }]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Search Bar for Products */}
        {mainTab === 'PRODUCTS' && (
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Search color="#64748B" size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm sản phẩm..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color="#38BDF8" size="large" />
          </View>
        ) : (
          <FlatList
            data={mainTab === 'PRODUCTS' ? filteredProducts : orders}
            renderItem={mainTab === 'PRODUCTS' ? renderProductItem : renderOrderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Package color="#1E293B" size={64} />
                <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
              </View>
            }
          />
        )}

        {/* Bottom Tabs */}
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setMainTab('PRODUCTS')}
          >
            <Package color={mainTab === 'PRODUCTS' ? '#38BDF8' : '#64748B'} size={24} />
            <Text style={[styles.navText, mainTab === 'PRODUCTS' && styles.activeNavText]}>Sản phẩm</Text>
            {mainTab === 'PRODUCTS' && <View style={[styles.navIndicator, { backgroundColor: '#38BDF8' }]} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setMainTab('ORDERS')}
          >
            <ClipboardList color={mainTab === 'ORDERS' ? '#38BDF8' : '#64748B'} size={24} />
            <Text style={[styles.navText, mainTab === 'ORDERS' && styles.activeNavText]}>Đơn hàng</Text>
            {mainTab === 'ORDERS' && <View style={[styles.navIndicator, { backgroundColor: '#38BDF8' }]} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B80',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 14 },
  filterSection: { marginVertical: 10 },
  filterList: { paddingHorizontal: 20, gap: 10 },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    gap: 6
  },
  filterLabel: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: { color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' },
  productCategory: { color: '#64748B', fontSize: 12, marginTop: 2 },
  productPrice: { color: '#FBBF24', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: { padding: 8, marginRight: 4 },
  deleteBtn: { padding: 8 },
  orderCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#1E293B',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderIdBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderId: { color: '#F8FAFC', fontSize: 14, fontWeight: 'bold' },
  orderTime: { color: '#64748B', fontSize: 12 },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  customerInfo: { flex: 1, marginRight: 12 },
  customerPhone: { color: '#F8FAFC', fontSize: 14, fontWeight: '500' },
  customerAddress: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  orderPrice: { color: '#FBBF24', fontSize: 16, fontWeight: 'bold' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 12 },
  itemCount: { color: '#64748B', fontSize: 12 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 60 },
  navText: { fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: 'bold' },
  activeNavText: { color: '#38BDF8' },
  navIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B', fontSize: 16, marginTop: 16 },
});

export default ShopManagementScreen;
