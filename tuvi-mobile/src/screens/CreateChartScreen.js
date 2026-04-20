import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, ChevronRight, History } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import { saveProfile } from '../api/profileStorage';

const CreateChartScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [viewYear, setViewYear] = useState('2026');
  const [gender, setGender] = useState(1); // 1: Nam, 0: Nữ
  const [isLunar, setIsLunar] = useState(false);

  const handleGenerate = async () => {
    if (!name || !day || !month || !year || !hour) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin để lập lá số.');
      return;
    }

    setLoading(true);
    try {
      const result = await axiosClient.post('/tuvi/generate', {
        name,
        day: parseInt(day),
        month: parseInt(month),
        year: parseInt(year),
        hour: parseInt(hour),
        minute: parseInt(minute || 0),
        gender,
        is_lunar: isLunar,
        view_year: parseInt(viewYear || 2026)
      });

      if (result) {
        await saveProfile(result);
        navigation.navigate('ChartDetail', { chartData: result });
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể lập lá số vào lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <History color="#FBBF24" size={28} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title} allowFontScaling={false}>LẬP LÁ SỐ</Text>
            <Text style={styles.subtitle} allowFontScaling={false}>NHẬP THÔNG TIN NGÀY GIỜ SINH</Text>
          </View>
  
          <View style={styles.form}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputGroup}>
              <User color="#94A3B8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Nguyễn Văn A"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />
            </View>
  
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity 
                    style={[styles.genderBtn, gender === 1 && styles.genderBtnActive]}
                    onPress={() => setGender(1)}
                  >
                    <Text style={[styles.genderBtnText, gender === 1 && styles.genderBtnTextActive]} allowFontScaling={false}>Nam</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.genderBtn, gender === 0 && styles.genderBtnActive]}
                    onPress={() => setGender(0)}
                  >
                    <Text style={[styles.genderBtnText, gender === 0 && styles.genderBtnTextActive]} allowFontScaling={false}>Nữ</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.label}>Lịch Âm</Text>
                <Switch
                  value={isLunar}
                  onValueChange={setIsLunar}
                  trackColor={{ false: '#334155', true: '#FBBF24' }}
                  thumbColor={isLunar ? '#FFFFFF' : '#94A3B8'}
                />
              </View>
            </View>
  
            <Text style={styles.label}>Ngày tháng năm sinh {isLunar ? '(Âm lịch)' : '(Dương lịch)'}</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                placeholder="Ngày"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={day}
                onChangeText={setDay}
              />
              <TextInput
                style={[styles.input, styles.dateInput]}
                placeholder="Tháng"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={month}
                onChangeText={setMonth}
              />
              <TextInput
                style={[styles.input, styles.dateInput, { flex: 2 }]}
                placeholder="Năm"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={year}
                onChangeText={setYear}
              />
            </View>
  
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Giờ sinh (Giờ : Phút)</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="Giờ"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={hour}
                    onChangeText={setHour}
                  />
                  <Text style={styles.separator}>:</Text>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="Phút"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={minute}
                    onChangeText={setMinute}
                  />
                </View>
              </View>
              <View style={{ width: 20 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Năm xem hạn</Text>
                <TextInput
                  style={[styles.input, styles.dateInput, { marginRight: 0 }]}
                  placeholder="2026"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={viewYear}
                  onChangeText={setViewYear}
                />
              </View>
            </View>
  
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <>
                  <Text style={styles.actionBtnText} allowFontScaling={false}>AN SAO LẬP LÁ SỐ</Text>
                  <ChevronRight color="#0F172A" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  topActions: {
    paddingHorizontal: 24,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  scrollContent: { padding: 24, paddingTop: 10 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FBBF24' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  label: { color: '#F8FAFC', fontSize: 14, marginBottom: 8, marginTop: 16, fontWeight: '600' },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 52, color: '#F8FAFC', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  dateInput: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    marginRight: 8,
    textAlign: 'center',
  },
  separator: { color: '#F8FAFC', fontSize: 24, paddingBottom: 16, marginRight: 8 },
  genderRow: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 12, padding: 4, alignSelf: 'flex-start', minWidth: 140 },
  genderBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  genderBtnActive: { backgroundColor: '#FBBF24' },
  genderBtnText: { color: '#94A3B8', fontWeight: 'bold' },
  genderBtnTextActive: { color: '#0F172A' },
  actionBtn: {
    backgroundColor: '#FBBF24',
    height: 60,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  actionBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
});

export default CreateChartScreen;
