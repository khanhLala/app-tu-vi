import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import DateTimePicker from '@react-native-community/datetimepicker';

const InputField = ({ label, icon, value, onChangeText, keyboardType = 'default' }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <View style={styles.iconBox}>{icon}</View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#64748B"
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

const EditProfileScreen = ({ navigation, route }) => {
  const { profile } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    dob: profile?.dob || '',
    address: profile?.address || '',
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

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axiosClient.put('/users/my-info', formData);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} allowFontScaling={false}>CHỈNH SỬA HỒ SƠ</Text>
          <TouchableOpacity onPress={handleUpdate} disabled={loading} style={styles.saveBtn}>
            {loading ? <ActivityIndicator size="small" color="#FBBF24" /> : <Save color="#FBBF24" size={24} />}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <InputField 
                  label="Họ" 
                  icon={<User color="#94A3B8" size={18} />} 
                  value={formData.firstName} 
                  onChangeText={(txt) => setFormData({...formData, firstName: txt})} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField 
                  label="Tên" 
                  icon={<User color="#94A3B8" size={18} />} 
                  value={formData.lastName} 
                  onChangeText={(txt) => setFormData({...formData, lastName: txt})} 
                />
              </View>
            </View>

            <InputField 
              label="Email" 
              icon={<Mail color="#94A3B8" size={18} />} 
              value={formData.email} 
              onChangeText={(txt) => setFormData({...formData, email: txt})} 
              keyboardType="email-address"
            />

            <InputField 
              label="Số điện thoại" 
              icon={<Phone color="#94A3B8" size={18} />} 
              value={formData.phone} 
              onChangeText={(txt) => setFormData({...formData, phone: txt})} 
              keyboardType="phone-pad"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày sinh</Text>
              <TouchableOpacity 
                style={styles.inputWrapper} 
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <View style={styles.iconBox}>
                  <Calendar color="#FBBF24" size={18} />
                </View>
                <Text style={[styles.input, { lineHeight: 54, color: formData.dob ? '#F8FAFC' : '#64748B' }]}>
                  {formData.dob || 'Chọn ngày sinh'}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={formData.dob ? new Date(formData.dob) : new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <InputField 
              label="Địa chỉ" 
              icon={<MapPin color="#94A3B8" size={18} />} 
              value={formData.address} 
              onChangeText={(txt) => setFormData({...formData, address: txt})} 
            />

            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.disabledBtn]} 
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.submitBtnText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FBBF24' },
  saveBtn: { padding: 4 },
  scrollContent: { padding: 20 },
  formCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  row: { flexDirection: 'row' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#94A3B8', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    height: 56,
  },
  iconBox: { width: 48, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, color: '#F8FAFC', fontSize: 15, paddingRight: 15 },
  submitBtn: {
    backgroundColor: '#FBBF24',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: { opacity: 0.7 },
  submitBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfileScreen;
