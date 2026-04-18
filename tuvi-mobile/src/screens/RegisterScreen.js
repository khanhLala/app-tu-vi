import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, Calendar } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import DateTimePicker from '@react-native-community/datetimepicker';

const RegisterScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    dob: '2004-08-17', 
  });

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setFormData({ ...formData, dob: `${year}-${month}-${day}` });
    }
  };

  const handleRegister = async () => {
    // Validation cơ bản
    if (!formData.username || !formData.password || !formData.email) {
      Alert.alert('Thông báo', 'Vui lòng nhập các thông tin bắt buộc (Username, Password, Email).');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/users', formData);
      Alert.alert(
        'Thành công', 
        'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const message = error.message || 'Có lỗi xảy ra trong quá trình đăng ký.';
      Alert.alert('Lỗi đăng ký', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#FBBF24" size={24} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title} allowFontScaling={false}>ĐĂNG KÝ</Text>
            <Text style={styles.subtitle} allowFontScaling={false}>KHỞI TẠO TÀI KHOẢN TỬ VI</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <User color="#94A3B8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập *"
                placeholderTextColor="#64748B"
                value={formData.username}
                onChangeText={(val) => setFormData({...formData, username: val})}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Lock color="#94A3B8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu *"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={formData.password}
                onChangeText={(val) => setFormData({...formData, password: val})}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Họ"
                  placeholderTextColor="#64748B"
                  value={formData.firstName}
                  onChangeText={(val) => setFormData({...formData, firstName: val})}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Tên"
                  placeholderTextColor="#64748B"
                  value={formData.lastName}
                  onChangeText={(val) => setFormData({...formData, lastName: val})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Mail color="#94A3B8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(val) => setFormData({...formData, email: val})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Phone color="#94A3B8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(val) => setFormData({...formData, phone: val})}
              />
            </View>

            <TouchableOpacity 
              style={styles.inputGroup} 
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Calendar color="#FBBF24" size={20} style={styles.inputIcon} />
              <View style={styles.input}>
                <Text style={{ color: formData.dob ? '#F8FAFC' : '#64748B', lineHeight: 52 }}>
                  {formData.dob || 'Chọn ngày sinh *'}
                </Text>
              </View>
              <Calendar color="#334155" size={16} /> 
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(formData.dob)}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <View style={styles.inputGroup}>
              <MapPin color="#94A3B8" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ"
                placeholderTextColor="#64748B"
                value={formData.address}
                onChangeText={(val) => setFormData({...formData, address: val})}
              />
            </View>

            <TouchableOpacity 
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.registerText} allowFontScaling={false}>TẠO TÀI KHOẢN</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
  },
  backBtn: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FBBF24',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    color: '#F8FAFC',
    fontSize: 15,
  },
  registerBtn: {
    backgroundColor: '#FBBF24',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  registerText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
