import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Sparkles, X } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import { getProfiles } from '../api/profileStorage';

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getProfiles();
    setHistory(data);
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Thông báo', 'Bạn cần nhập nội dung bài viết.');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/posts', {
        content,
        chartData: selectedChart ? JSON.stringify(selectedChart.full_data) : null,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng bài vào lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#FBBF24" size={24} />
          </TouchableOpacity>
        <Text style={styles.title}>ĐĂNG BÀI</Text>
        <TouchableOpacity onPress={handlePost} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FBBF24" size="small" />
          ) : (
            <Text style={styles.postBtnText}>ĐĂNG</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Bạn đang nghiệm thái gì thế?"
          placeholderTextColor="#64748B"
          multiline
          value={content}
          onChangeText={setContent}
        />

        {selectedChart ? (
          <View style={styles.selectedBox}>
            <View>
              <Text style={styles.selectedTitle}>Đang đính kèm: {selectedChart.personal_info.name}</Text>
              <Text style={styles.selectedSub}>{selectedChart.personal_info.solar_date}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedChart(null)}>
              <X color="#EF4444" size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.attachBtn}
            onPress={() => setShowPicker(!showPicker)}
          >
            <Sparkles color="#FBBF24" size={20} />
            <Text style={styles.attachText}>ĐÍNH KÈM LÁ SỐ TỪ LỊCH SỬ</Text>
          </TouchableOpacity>
        )}

        {showPicker && !selectedChart && (
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Chọn lá số từ máy bạn:</Text>
            {history.length === 0 ? (
                <Text style={styles.noHistory}>Chưa có lịch sử lập lá số nào.</Text>
            ) : (
                history.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.historyItem}
                      onPress={() => {
                        setSelectedChart(item);
                        setShowPicker(false);
                      }}
                    >
                      <Text style={styles.historyName}>{item.personal_info.name}</Text>
                      <Text style={styles.historyDate}>{item.personal_info.solar_date}</Text>
                    </TouchableOpacity>
                  ))
            )}
          </View>
        )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  title: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  postBtnText: { color: '#FBBF24', fontSize: 16, fontWeight: 'bold' },
  content: { padding: 20 },
  input: {
    color: '#F1F5F9',
    fontSize: 18,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  attachText: { color: '#FBBF24', fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
  selectedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  selectedTitle: { color: '#FBBF24', fontSize: 14, fontWeight: 'bold' },
  selectedSub: { color: '#94A3B8', fontSize: 12 },
  pickerContainer: { marginTop: 20, backgroundColor: '#1E293B', borderRadius: 12, padding: 16 },
  pickerTitle: { color: '#64748B', fontSize: 12, marginBottom: 12, fontWeight: 'bold' },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  historyName: { color: '#F8FAFC', fontSize: 14, fontWeight: 'bold' },
  historyDate: { color: '#94A3B8', fontSize: 12 },
  noHistory: { color: '#64748B', fontSize: 14, textAlign: 'center', padding: 20 }
});

export default CreatePostScreen;
