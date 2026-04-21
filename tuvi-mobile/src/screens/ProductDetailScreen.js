import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ShoppingCart, Star, MessageSquare } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import productApi from '../api/productApi';
import reviewApi from '../api/reviewApi';

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
  const [canReview, setCanReview] = useState(false);
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes, eRes] = await Promise.all([
          productApi.getProductById(productId),
          reviewApi.getReviewsByProduct(productId),
          reviewApi.checkEligibility(productId)
        ]);
        setProduct(pRes);
        setReviews(rRes || []);
        setCanReview(eRes);
      } catch (e) {
        Alert.alert('Lỗi', 'Không thể tải chi tiết sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng.');
    } catch (e) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thực hiện chức năng này.');
    } finally {
      setAdding(false);
    }
  };

  const handleContactZalo = () => {
    const phoneNumber = '0842452110';
    const message = encodeURIComponent(`Tôi muốn xem tử vi gói: ${product.name}`);
    const url = `https://zalo.me/${phoneNumber}?text=${message}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở Zalo trên thiết bị này.');
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FBBF24" />
      </LinearGradient>
    );
  }

  if (!product && !loading) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.centerContainer}>
        <Text style={styles.noReviews}>Không tìm thấy thông tin sản phẩm.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#FBBF24', fontSize: 16 }}>Quay lại</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const isService = product?.type === 'SERVICE' || product?.category?.includes('Gói xem');
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
            <ShoppingCart color="#F8FAFC" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image source={{ uri: product.imageUrl }} style={styles.heroImage} />
          
          <View style={styles.infoCard}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.productName}>{product.name}</Text>

            <View style={styles.ratingRow}>
              <StarRating rating={Math.round(parseFloat(averageRating))} />
              <Text style={styles.ratingText}>
                {reviews.length > 0 ? `${averageRating} (${reviews.length} đánh giá)` : 'Chưa có đánh giá'}
              </Text>
            </View>

            <Text style={styles.price}>
              {Number(product.price).toLocaleString('vi-VN')}đ
            </Text>

            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{product.description}</Text>

            <View style={styles.divider} />

            {/* Reviews Section */}
            <View style={styles.reviewsHeaderRow}>
              <MessageSquare size={20} color="#FBBF24" />
              <Text style={styles.sectionTitle}>Đánh giá khách hàng ({reviews.length})</Text>
              {canReview && (
                <TouchableOpacity 
                  style={styles.addReviewBtn}
                  onPress={() => navigation.navigate('Review', { 
                    productId: product.id, 
                    productName: product.name 
                  })}
                >
                  <Text style={styles.addReviewBtnText}>Viết đánh giá</Text>
                </TouchableOpacity>
              )}
            </View>

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
                      <Text style={styles.reviewUsername}>{rv.username}</Text>
                      <StarRating rating={rv.rating} size={12} />
                    </View>
                    <Text style={styles.reviewDate}>
                      {rv.createdAt ? new Date(rv.createdAt).toLocaleDateString('vi-VN') : ''}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{rv.comment}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={[styles.stickyFooter, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
          {isService ? (
            <TouchableOpacity 
              style={styles.zaloBtn} 
              onPress={handleContactZalo}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.btnGradient}>
                <Text style={styles.btnText}>LIÊN HỆ ZALO XEM TỬ VI</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.addToCartBtn, adding && { opacity: 0.7 }]}
              onPress={handleAddToCart}
              disabled={adding}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#FBBF24', '#F59E0B']} style={styles.btnGradient}>
                <ShoppingCart color="#0F172A" size={20} />
                <Text style={styles.addToCartText}>
                  {adding ? 'Đang thêm...' : 'Thêm vào Giỏ Hàng'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#334155', backgroundColor: 'rgba(15, 23, 42, 0.8)'
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: 'bold', flex: 1 },
  cartBtn: { padding: 4 },
  scrollContent: { paddingBottom: 120 },
  heroImage: { width: '100%', height: 350, resizeMode: 'cover' },
  infoCard: { padding: 20 },
  category: { color: '#FBBF24', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 },
  productName: { color: '#F8FAFC', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ratingText: { color: '#94A3B8', fontSize: 13 },
  price: { color: '#FBBF24', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  divider: { height: 0.5, backgroundColor: '#334155', marginVertical: 20 },
  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  description: { color: '#94A3B8', fontSize: 15, lineHeight: 24, marginTop: 10 },
  reviewsHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  reviewItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: 12, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#334155',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FBBF24', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  reviewUsername: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 3 },
  reviewDate: { color: '#64748B', fontSize: 11 },
  reviewComment: { color: '#CBD5E1', fontSize: 14, lineHeight: 20 },
  noReviews: { color: '#64748B', fontSize: 14, fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 },
  addReviewBtn: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: '#FBBF24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addReviewBtnText: { color: '#FBBF24', fontSize: 13, fontWeight: 'bold' },
  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 0.5, borderTopColor: '#334155',
  },
  addToCartBtn: { borderRadius: 14, overflow: 'hidden' },
  zaloBtn: { borderRadius: 14, overflow: 'hidden' },
  btnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10,
  },
  addToCartText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ProductDetailScreen;
