import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const PasswordInput = ({ label, value, onChangeText, show, setShow }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <View style={styles.iconBox}><Lock color="#94A3B8" size={18} /></View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!show}
        placeholder="••••••••"
        placeholderTextColor="#334155"
      />
      <TouchableOpacity style={styles.eyeBox} onPress={() => setShow(!show)}>
        {show ? <EyeOff color="#94A3B8" size={20} /> : <Eye color="#94A3B8" size={20} />}
      </TouchableOpacity>
    </View>
  </View>
);

const SecurityScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async () => {
    if (!formData.oldPassword || !formData.newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp.');
      return;
    }
    if (formData.newPassword.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/users/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Mật khẩu cũ không chính xác.');
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
          <Text style={styles.headerTitle}>BẢO MẬT</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoBox}>
            <ShieldCheck color="#FBBF24" size={32} />
            <Text style={styles.infoTitle}>Đổi mật khẩu</Text>
            <Text style={styles.infoDesc}>Bạn nên sử dụng mật khẩu mạnh bao gồm chữ cái, chữ số và ký tự đặc biệt.</Text>
          </View>

          <View style={styles.formCard}>
            <PasswordInput 
              label="Mật khẩu hiện tại" 
              value={formData.oldPassword} 
              onChangeText={(txt) => setFormData({...formData, oldPassword: txt})} 
              show={showOld} 
              setShow={setShowOld} 
            />
            
            <View style={styles.divider} />

            <PasswordInput 
              label="Mật khẩu mới" 
              value={formData.newPassword} 
              onChangeText={(txt) => setFormData({...formData, newPassword: txt})} 
              show={showNew} 
              setShow={setShowNew} 
            />

            <PasswordInput 
              label="Xác nhận mật khẩu mới" 
              value={formData.confirmPassword} 
              onChangeText={(txt) => setFormData({...formData, confirmPassword: txt})} 
              show={showConfirm} 
              setShow={setShowConfirm} 
            />

            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.disabledBtn]} 
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.submitBtnText}>Cập nhật mật khẩu</Text>
              )}
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
  scrollContent: { padding: 20 },
  infoBox: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 },
  infoTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  infoDesc: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  formCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
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
  input: { flex: 1, color: '#F8FAFC', fontSize: 15 },
  eyeBox: { width: 48, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: '#334155', marginBottom: 25, marginTop: 5 },
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

export default SecurityScreen;
