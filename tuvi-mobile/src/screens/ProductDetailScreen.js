import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, ToastAndroid, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react-native';
import productApi from '../api/productApi';
import { useCart } from '../context/CartContext';

const StarRating = ({ rating, size = 16 }) => (
  <View style={{ flexDirection: 'row', gap: 3 }}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i} size={size}
        color={i < rating ? '#FBBF24' : '#334155'}
        fill={i < rating ? '#FBBF24' : 'transparent'}
      />
    ))}
  </View>
);

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const [prod, revs] = await Promise.all([
          productApi.getById(productId),
          productApi.getReviews(productId),
        ]);
        setProduct(prod);
        setReviews(Array.isArray(revs) ? revs : []);
      } catch (e) {
        Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(productId, 1);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Đã thêm vào giỏ hàng!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Thành công', 'Đã thêm vào giỏ hàng!');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.centerContainer}>
        <ActivityIndicator color="#FBBF24" size="large" />
      </LinearGradient>
    );
  }

  if (!product) return null;

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#F8FAFC" size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} allowFontScaling={false}>Chi tiết sản phẩm</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Product Image */}
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.imagePlaceholder]}>
              <ShoppingCart color="#64748B" size={48} />
            </View>
          )}

          {/* Product Info */}
          <View style={styles.infoCard}>
            <Text style={styles.category} allowFontScaling={false}>{product.category}</Text>
            <Text style={styles.productName} allowFontScaling={false}>{product.name}</Text>

            <View style={styles.ratingRow}>
              {avgRating && <StarRating rating={Math.round(parseFloat(avgRating))} />}
              <Text style={styles.ratingText}>
                {avgRating ? `${avgRating} (${reviews.length} đánh giá)` : 'Chưa có đánh giá'}
              </Text>
            </View>

            <Text style={styles.price} allowFontScaling={false}>
              {Number(product.price).toLocaleString('vi-VN')}đ
            </Text>

            <Text style={styles.sectionTitle} allowFontScaling={false}>Mô tả</Text>
            <Text style={styles.description} allowFontScaling={false}>{product.description}</Text>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsCard}>
            <Text style={styles.sectionTitle} allowFontScaling={false}>
              Đánh giá khách hàng ({reviews.length})
            </Text>

            {reviews.length === 0 ? (
              <Text style={styles.noReviews}>Chưa có đánh giá nào. Hãy là người đầu tiên!</Text>
            ) : (
              reviews.map(rv => (
                <View key={rv.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{rv.username?.[0]?.toUpperCase() || '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewUsername} allowFontScaling={false}>{rv.username}</Text>
                      <StarRating rating={rv.rating} size={13} />
                    </View>
                    <Text style={styles.reviewDate} allowFontScaling={false}>
                      {rv.createdAt ? new Date(rv.createdAt).toLocaleDateString('vi-VN') : ''}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment} allowFontScaling={false}>{rv.comment}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Sticky Add to Cart Button */}
        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={[styles.addToCartBtn, adding && { opacity: 0.7 }]}
            onPress={handleAddToCart}
            disabled={adding}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#FBBF24', '#F59E0B']} style={styles.addToCartGradient}>
              <ShoppingCart color="#0F172A" size={20} />
              <Text style={styles.addToCartText} allowFontScaling={false}>
                {adding ? 'Đang thêm...' : 'Thêm vào Giỏ Hàng'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#334155',
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: 'bold', flex: 1 },
  scrollContent: { paddingBottom: 100 },
  heroImage: { width: '100%', height: 240, resizeMode: 'cover' },
  imagePlaceholder: { backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  infoCard: { padding: 20 },
  category: { color: '#FBBF24', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 },
  productName: { color: '#F8FAFC', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ratingText: { color: '#94A3B8', fontSize: 13 },
  price: { color: '#FBBF24', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  description: { color: '#94A3B8', fontSize: 14, lineHeight: 22 },
  reviewsCard: { padding: 20, borderTopWidth: 0.5, borderTopColor: '#334155' },
  reviewItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: 12, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#334155',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FBBF24', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  reviewUsername: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 3 },
  reviewDate: { color: '#64748B', fontSize: 12 },
  reviewComment: { color: '#CBD5E1', fontSize: 14, lineHeight: 20 },
  noReviews: { color: '#64748B', fontSize: 14, fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 },
  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 0.5, borderTopColor: '#334155',
  },
  addToCartBtn: { borderRadius: 14, overflow: 'hidden' },
  addToCartGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10,
  },
  addToCartText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default ProductDetailScreen;
