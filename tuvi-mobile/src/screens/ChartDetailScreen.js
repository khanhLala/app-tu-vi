import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  Clipboard,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Share2, Clipboard as CopyIcon, X, MessageCircle } from 'lucide-react-native';
import PalaceBox from '../components/PalaceBox';

const { width } = Dimensions.get('window');
const CELL_SIZE = width / 4;

const ChartDetailScreen = ({ navigation, route }) => {
  const { chartData, hidePrivateInfo = false } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();


  // Thứ tự các cung trong lưới 4x4 (0-11 tương ứng Hợi-Tý-Sửu... trong data)
  // Vị trí:
  // 5 (Tỵ)  | 6 (Ngọ)  | 7 (Mùi)  | 8 (Thân)
  // 4 (Thìn) | Thiên bàn         | 9 (Dậu)
  // 3 (Mão) | Thiên bàn         | 10 (Tuất)
  // 2 (Dần) | 1 (Sửu)  | 0 (Tý)   | 11 (Hợi)
  
  const palaces = chartData?.palaces;
  const info = chartData?.personal_info;

  // Kiểm tra an toàn: Nếu không có dữ liệu (lá số cũ hoặc lỗi), không render tiếp tránh sập App
  if (!palaces || !info) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft color="#FBBF24" size={24} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>LỖI DỮ LIỆU</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#94A3B8', fontSize: 16, textAlign: 'center' }}>
              Rất tiếc, dữ liệu chi tiết của lá số này không khả dụng hoặc đã cũ. Hãy thử lập lá số mới nhé!
            </Text>
            <TouchableOpacity 
              style={[styles.promptBtn, { marginTop: 20, width: '100%' }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.promptBtnText}>QUAY LẠI</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Phân tách dữ liệu Bát Tự
  const batTuParts = (info.bat_tu || '').split(' - ');
  const solarParts = (info.solar_date || '').split(' ');
  const solarDay = solarParts[0];
  const solarTime = solarParts[1];

  const InfoRow = ({ label, value, subValue }) => (
    <View style={styles.centerRow}>
      <Text style={styles.centerLabel}>{label}: </Text>
      <Text style={styles.centerVal}>{value} {subValue && <Text style={styles.centerSubVal}>{subValue}</Text>}</Text>
    </View>
  );

  const maskInfo = (text) => hidePrivateInfo ? '********' : text;

  const renderGrid = () => {
    return (
      <View style={styles.grid}>
        {/* Hàng 1 */}
        <View style={styles.row}>
          <PalaceBox data={palaces["5"]} />
          <PalaceBox data={palaces["6"]} />
          <PalaceBox data={palaces["7"]} />
          <PalaceBox data={palaces["8"]} />
        </View>
        {/* Hàng 2 & 3 - Nhập làm Thiên Bàn ở giữa */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
             <PalaceBox data={palaces["4"]} />
             <PalaceBox data={palaces["3"]} />
          </View>
          
          <View style={styles.centerTable}>
            <View style={styles.listContainer}>
              <Text style={styles.uniformText}>Họ và tên: {info.name}</Text>
              <Text style={styles.uniformText}>Ngày sinh: {maskInfo(solarDay)}</Text>
              <Text style={styles.uniformText}>Giờ sinh: {maskInfo(solarTime)}</Text>
              <Text style={styles.uniformText}>Âm lịch: {maskInfo(info.lunar_date)}</Text>
              
              <Text style={styles.uniformText}>Bản mệnh: {info.ban_menh}</Text>
              <Text style={styles.uniformText}>Cục: {info.cuc}</Text>
              <Text style={styles.uniformText}>Giới tính: {info.am_duong_nam_nu}</Text>
              
              <View style={{ marginVertical: 4 }} />
              
              <Text style={styles.uniformText}>BÁT TỰ:</Text>
              <Text style={styles.uniformText}>
                {maskInfo(batTuParts[0])}     {maskInfo(batTuParts[1])}     {maskInfo(batTuParts[2])}     {maskInfo(batTuParts[3])}
              </Text>
              
              <View style={{ marginVertical: 4 }} />
              
              <Text style={styles.uniformText}>{info.am_duong_ly}</Text>
              <Text style={styles.uniformText}>Năm xem: {info.view_year}</Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
             <PalaceBox data={palaces["9"]} />
             <PalaceBox data={palaces["10"]} />
          </View>
        </View>
        {/* Hàng 4 */}
        <View style={styles.row}>
          <PalaceBox data={palaces["2"]} />
          <PalaceBox data={palaces["1"]} />
          <PalaceBox data={palaces["0"]} />
          <PalaceBox data={palaces["11"]} />
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#FBBF24" size={24} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>LÁ SỐ TỬ VI</Text>
          {!hidePrivateInfo ? (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Share2 color="#FBBF24" size={24} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.infoBanner}>
              <Text style={styles.infoText}>Ngày sinh: {maskInfo(chartData.personal_info.solar_date)}</Text>
              <Text style={styles.infoText}>Âm lịch: {maskInfo(chartData.personal_info.lunar_date)}</Text>
          </View>

          {!hidePrivateInfo && (
            <View style={styles.aiHeaderActions}>
              <TouchableOpacity 
                style={[styles.aiHeaderBtn, { backgroundColor: '#FBBF24' }]}
                onPress={() => setModalVisible(true)}
              >
                <CopyIcon color="#0F172A" size={16} />
                <Text style={[styles.aiHeaderBtnText, { color: '#0F172A' }]}>PROMPT</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.aiHeaderBtn, { borderColor: '#FBBF24', borderWidth: 1 }]}
                onPress={() => navigation.navigate('Chat', { chartData })}
              >
                <MessageCircle color="#FBBF24" size={16} />
                <Text style={[styles.aiHeaderBtnText, { color: '#FBBF24' }]}>HỎI AI</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.zoomContainer}>
            {renderGrid()}
          </View>

          <View style={styles.legend}>
              <Text style={styles.legendTitle}>Ghi chú:</Text>
              <Text style={styles.legendItem}>• Màu đỏ: Chính tinh</Text>
              <Text style={styles.legendItem}>• Màu xanh: Cát tinh</Text>
              <Text style={styles.legendItem}>• Màu xám: Hung tinh</Text>
          </View>
          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>


        {/* Modal hiển thị Prompt */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thông tin lá số kèm prompt</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X color="#94A3B8" size={24} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.promptScroll}>
                <Text style={styles.promptText}>{chartData.ai_prompt}</Text>
              </ScrollView>
              <TouchableOpacity style={styles.copyBtn} onPress={() => {
                Clipboard.setString(chartData.ai_prompt);
                Alert.alert('Thành công', 'Đã sao chép Prompt vào bộ nhớ tạm.');
              }}>
                <Text style={styles.copyBtnText}>SAO CHÉP TOÀN BỘ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  zoomContainer: { paddingVertical: 20 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  navTitle: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1 },
  infoBanner: {
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    margin: 10,
    borderRadius: 8,
  },
  infoText: { color: '#F8FAFC', fontSize: 12, marginBottom: 4 },
  grid: {
    padding: 2,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
  },
  centerTable: {
    flex: 2,
    borderWidth: 0.5,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    padding: 10,
    justifyContent: 'center',
  },
  listContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  uniformText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    marginBottom: 4,
    lineHeight: 12,
    textAlign: 'left',
  },
  aiHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  aiHeaderBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  aiHeaderBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  promptBtn: {
    backgroundColor: '#FBBF24',
    margin: 16,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  promptBtnText: { color: '#0F172A', fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
  aiBtn: {
    borderColor: '#FBBF24',
    borderWidth: 1.5,
    marginHorizontal: 16,
    marginBottom: 16,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(251,191,36,0.08)',
  },
  aiBtnText: { color: '#FBBF24', fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
  legend: { padding: 20 },
  legendTitle: { color: '#FBBF24', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  legendItem: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  promptScroll: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  promptText: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  copyBtn: {
    backgroundColor: '#FBBF24',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default ChartDetailScreen;
