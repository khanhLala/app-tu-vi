import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag, Star, Zap, CreditCard } from 'lucide-react-native';

const ShopScreen = () => {
  const items = [
    { id: 1, name: 'Gói Xem Hạn Năm', price: '199.000đ', icon: <Star color="#FBBF24" size={24} />, desc: 'Luận giải chi tiết 12 tháng' },
    { id: 2, name: 'Gói Combo Trọn Đời', price: '999.000đ', icon: <Zap color="#FBBF24" size={24} />, desc: 'Không giới hạn số lượt lập lá số' },
    { id: 3, name: 'Vật Phẩm Phong Thủy', price: 'Liên hệ', icon: <ShoppingBag color="#FBBF24" size={24} />, desc: 'Vòng tay, linh vật hộ thân' },
  ];

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title} allowFontScaling={false}>CỬA HÀNG</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subtitle} allowFontScaling={false}>NÂNG CẤP TRẢI NGHIỆM</Text>
          {items.map(item => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <View style={styles.iconContainer}>{item.icon}</View>
              <View style={styles.info}>
                <Text style={styles.itemName} allowFontScaling={false}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <View style={styles.priceTag}>
                <Text style={styles.price} allowFontScaling={false}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          <View style={styles.comingSoon}>
            <CreditCard color="#94A3B8" size={40} />
            <Text style={styles.comingSoonText}>Hệ thống thanh toán đang được nâng cấp</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingTop: 10, paddingBottom: 20, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FBBF24' },
  scrollContent: { padding: 20 },
  subtitle: { color: '#94A3B8', fontSize: 12, marginBottom: 20 },
  card: { backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(251, 191, 36, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  info: { flex: 1 },
  itemName: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  itemDesc: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  priceTag: { backgroundColor: '#FBBF24', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  price: { color: '#0F172A', fontSize: 12, fontWeight: 'bold' },
  comingSoon: { marginTop: 40, alignItems: 'center', opacity: 0.5 },
  comingSoonText: { color: '#94A3B8', fontSize: 14, marginTop: 12 },
});

export default ShopScreen;
