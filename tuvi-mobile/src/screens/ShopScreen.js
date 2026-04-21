import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Linking, Image, ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, ShoppingCart, Star, Search, X } from 'lucide-react-native';
import productApi from '../api/productApi';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['Tất cả', 'Gói xem lá số', 'Vật Phẩm Phong Thủy'];

const ShopScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const { cartCount, fetchCart } = useCart();

  const loadProducts = useCallback(async () => {
    try {
      const data = await productApi.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    fetchCart();
  }, []);

  const filteredProducts = React.useMemo(() => {
    return products.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleContactZalo = () => {
    Linking.openURL('https://zalo.me/0842452110').catch(err => console.error("Couldn't load page", err));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} color={i < rating ? '#FBBF24' : '#334155'} fill={i < rating ? '#FBBF24' : 'transparent'} />
    ));
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.zaloHeaderBtn} onPress={handleContactZalo}>
            <MessageCircle color="#0068FF" size={24} />
          </TouchableOpacity>
          <Text style={styles.title} allowFontScaling={false}>CỬA HÀNG</Text>
          <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart color="#FBBF24" size={24} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProducts(); }} tintColor="#FBBF24" />}
        >
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Search color="#64748B" size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm vật phẩm..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
                allowFontScaling={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X color="#64748B" size={20} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.activeCategoryChip
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.activeCategoryChipText
                ]} allowFontScaling={false}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.subtitle} allowFontScaling={false}>KẾT QUẢ ({filteredProducts.length})</Text>

          {loading ? (
            <ActivityIndicator color="#FBBF24" size="large" style={{ marginTop: 40 }} />
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Search color="#334155" size={48} />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm phù hợp</Text>
            </View>
          ) : (
            filteredProducts.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                activeOpacity={0.8}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.imagePlaceholder]}>
                    <ShoppingCart color="#64748B" size={28} />
                  </View>
                )}
                <View style={styles.info}>
                  <Text style={styles.category} allowFontScaling={false}>{item.category}</Text>
                  <Text style={styles.itemName} allowFontScaling={false}>{item.name}</Text>
                  <View style={styles.stars}>{renderStars(4)}</View>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.price} allowFontScaling={false}>
                    {Number(item.price).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  header: {
    paddingTop: 10, paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 0.5, borderBottomColor: '#334155',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FBBF24' },
  zaloHeaderBtn: { position: 'absolute', left: 20, padding: 4 },
  cartBtn: { position: 'absolute', right: 20, padding: 4 },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  subtitle: { color: '#94A3B8', fontSize: 12, marginBottom: 16, marginTop: 8 },
  itemName: { color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#334155', overflow: 'hidden', flexDirection: 'row', alignItems: 'center',
  },
  productImage: { width: 80, height: 80, resizeMode: 'cover' },
  imagePlaceholder: { backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  category: { color: '#64748B', fontSize: 10, marginBottom: 4, textTransform: 'uppercase' },
  itemName: { color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' },
  stars: { flexDirection: 'row', marginTop: 6, gap: 2 },
  priceTag: {
    backgroundColor: '#FBBF24', paddingHorizontal: 10, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', minWidth: 72,
  },
  price: { color: '#0F172A', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 16, fontSize: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.8 },
  searchSection: { marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    paddingVertical: 10,
  },
  categoryScroll: { marginBottom: 20, marginHorizontal: -16 },
  categoryContainer: { paddingHorizontal: 16, gap: 10 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeCategoryChip: {
    backgroundColor: '#FBBF24',
    borderColor: '#FBBF24',
  },
  categoryChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  activeCategoryChipText: {
    color: '#0F172A',
  },
});

export default ShopScreen;
