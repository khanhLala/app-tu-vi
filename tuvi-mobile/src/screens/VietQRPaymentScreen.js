import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Copy, Share2, CheckCircle2, AlertCircle } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const VietQRPaymentScreen = ({ route, navigation }) => {
  const { order, paymentUrl } = route.params;

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Đã sao chép', `Đã sao chép ${label} vào bộ nhớ tạm.`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Thanh toán đơn hàng Tử Vi: ${order.id.substring(0, 8).toUpperCase()}\nSố tiền: ${Number(order.totalPrice).toLocaleString()}đ\nSTK: 00000032239 - TPBank`,
      });
    } catch (error) {
      console.log(error.message);
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
          <Text style={styles.headerTitle}>Thanh toán VietQR</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <Text style={styles.qrMessage}>Quét mã QR bằng ứng dụng Ngân hàng để thanh toán</Text>
            <View style={styles.qrFrame}>
              <Image 
                source={{ uri: paymentUrl }} 
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 size={18} color="#FBBF24" />
              <Text style={styles.shareText}>Chia sẻ mã QR</Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Chủ tài khoản</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>DO HAI NAM</Text>
                <TouchableOpacity onPress={() => copyToClipboard('DO HAI NAM', 'tên chủ TK')}>
                  <Copy size={16} color="#FBBF24" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Số tài khoản (TPBank)</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>00000032239</Text>
                <TouchableOpacity onPress={() => copyToClipboard('00000032239', 'số tài khoản')}>
                  <Copy size={16} color="#FBBF24" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Số tiền</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoPrice}>{Number(order.totalPrice).toLocaleString('vi-VN')}đ</Text>
                <TouchableOpacity onPress={() => copyToClipboard(order.totalPrice.toString(), 'số tiền')}>
                  <Copy size={16} color="#FBBF24" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nội dung chuyển khoản</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>TUVI {order.id.substring(0, 8).toUpperCase()}</Text>
                <TouchableOpacity onPress={() => copyToClipboard(`TUVI ${order.id.substring(0, 8).toUpperCase()}`, 'nội dung')}>
                  <Copy size={16} color="#FBBF24" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Guidelines */}
          <View style={styles.guideBox}>
            <AlertCircle size={18} color="#94A3B8" />
            <Text style={styles.guideText}>
              Vui lòng giữ đúng nội dung chuyển khoản để hệ thống ghi nhận đơn hàng nhanh nhất.
            </Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity 
            style={styles.confirmBtn}
            onPress={() => navigation.navigate('OrderSuccess')}
          >
            <LinearGradient colors={['#FBBF24', '#F59E0B']} style={styles.btnGradient}>
              <CheckCircle2 size={20} color="#0F172A" />
              <Text style={styles.btnText}>Xác nhận đã chuyển tiền</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Quay lại</Text>
          </TouchableOpacity>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  qrSection: { alignItems: 'center', marginBottom: 24 },
  qrMessage: { color: '#CBD5E1', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  qrFrame: { 
    width: 240, height: 240, backgroundColor: '#FFFFFF', borderRadius: 20, 
    padding: 16, justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8,
  },
  qrImage: { width: '100%', height: '100%' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  shareText: { color: '#FBBF24', fontWeight: 'bold', fontSize: 14 },
  infoSection: { 
    backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 20, 
    padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#334155' 
  },
  infoItem: { marginBottom: 16 },
  infoLabel: { color: '#64748B', fontSize: 12, marginBottom: 4 },
  infoValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoValue: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  infoPrice: { color: '#FBBF24', fontSize: 20, fontWeight: 'bold' },
  guideBox: { 
    flexDirection: 'row', backgroundColor: 'rgba(51, 65, 85, 0.3)', 
    padding: 16, borderRadius: 16, alignItems: 'center', gap: 12, marginBottom: 30 
  },
  guideText: { color: '#94A3B8', fontSize: 13, flex: 1 },
  confirmBtn: { height: 56, borderRadius: 16, overflow: 'hidden' },
  btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { marginTop: 16, alignItems: 'center', padding: 12 },
  cancelBtnText: { color: '#64748B', fontSize: 14, fontWeight: 'bold' },
});

export default VietQRPaymentScreen;
