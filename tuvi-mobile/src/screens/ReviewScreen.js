import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star, Send } from 'lucide-react-native';
import reviewApi from '../api/reviewApi';

const ReviewScreen = ({ route, navigation }) => {
  const { productId, productName, orderId } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá.');
      return;
    }

    setLoading(true);
    try {
      await reviewApi.createReview({
        productId,
        orderId,
        rating,
        comment: comment.trim(),
      });
      Alert.alert('Thành công', 'Cảm ơn bạn đã gửi đánh giá!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Bạn đã đánh giá rồi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.productLabel}>Bạn đang đánh giá:</Text>
            <Text style={styles.productName}>{productName}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Chọn số sao</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Star 
                    size={40} 
                    color={s <= rating ? "#FBBF24" : "#334155"} 
                    fill={s <= rating ? "#FBBF24" : "transparent"} 
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingHint}>
              {rating === 5 ? 'Rất hài lòng' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không hài lòng' : 'Rất tệ'}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Nội dung nhận xét</Text>
            <TextInput
              style={styles.input}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={6}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient colors={['#FBBF24', '#F59E0B']} style={styles.btnGradient}>
                {loading ? (
                  <ActivityIndicator color="#0F172A" />
                ) : (
                  <>
                    <Send size={20} color="#0F172A" />
                    <Text style={styles.btnText}>GỬI ĐÁNH GIÁ</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' 
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' },
  productLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 4 },
  productName: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 20 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  ratingHint: { color: '#FBBF24', textAlign: 'center', marginTop: 10, fontWeight: '500' },
  input: {
    backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: 12, padding: 16,
    fontSize: 15, marginBottom: 20, borderWidth: 1, borderColor: '#334155', height: 150,
  },
  submitBtn: { height: 56, borderRadius: 16, overflow: 'hidden' },
  btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default ReviewScreen;
