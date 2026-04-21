import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react-native';

const OrderSuccessScreen = ({ navigation }) => {
  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <CheckCircle size={80} color="#10B981" />
          </View>
          
          <Text style={styles.title}>Đặt hàng thành công!</Text>
          <Text style={styles.subtitle}>
            Cảm ơn bạn đã tin tưởng chọn mua vật phẩm tại Tử Vi. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Main')}
            >
              <LinearGradient colors={['#FBBF24', '#F59E0B']} style={styles.btnGradient}>
                <Home size={20} color="#0F172A" />
                <Text style={styles.primaryBtnText}>Về trang chủ</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Main', { screen: 'Shop' })}
            >
              <ShoppingBag size={20} color="#FBBF24" />
              <Text style={styles.secondaryBtnText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  iconContainer: { marginBottom: 24 },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  subtitle: { color: '#94A3B8', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  buttonGroup: { width: '100%', gap: 16 },
  primaryBtn: { borderRadius: 14, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  primaryBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  secondaryBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: '#FBBF24', gap: 10 
  },
  secondaryBtnText: { color: '#FBBF24', fontSize: 16, fontWeight: 'bold' },
});

export default OrderSuccessScreen;
