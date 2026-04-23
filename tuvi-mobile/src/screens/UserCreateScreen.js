import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  UserPlus,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

// Đặt ngoài component để tránh re-render mất focus bàn phím
const InputField = ({ icon, label, value, onChangeText, placeholder, keyboardType = 'default', rightIcon }) => (
  <View style={styles.inputSection}>
    <Text style={styles.inputLabel} allowFontScaling={false}>{label}</Text>
    <View style={styles.inputGroup}>
      <View style={styles.inputIconWrapper}>{icon}</View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
    </View>
  </View>
);

const PasswordField = ({ label, value, onChangeText, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel} allowFontScaling={false}>{label}</Text>
      <View style={styles.inputGroup}>
        <View style={styles.inputIconWrapper}>
          <Lock color="#94A3B8" size={18} />
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.rightIconWrapper} onPress={() => setShow(s => !s)}>
          {show ? <EyeOff color="#64748B" size={18} /> : <Eye color="#64748B" size={18} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const UserCreateScreen = ({ navigation }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    if (!form.username.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đăng nhập.');
      return false;
    }
    if (form.username.trim().length < 3) {
      Alert.alert('Không hợp lệ', 'Tên đăng nhập phải có ít nhất 3 ký tự.');
      return false;
    }
    if (!form.password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mật khẩu.');
      return false;
    }
    if (form.password.length < 8) {
      Alert.alert('Không hợp lệ', 'Mật khẩu phải có ít nhất 8 ký tự.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Không khớp', 'Mật khẩu xác nhận không khớp.');
      return false;
    }
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      Alert.alert('Không hợp lệ', 'Địa chỉ email không đúng định dạng.');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        firstName: form.firstName.trim() || null,
        lastName: form.lastName.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      };
      await axiosClient.post('/users', payload);
      Alert.alert('Thành công', `Tài khoản "${form.username}" đã được tạo thành công.`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const msg = error?.message || '';
      if (msg.includes('USER_EXISTED') || msg.includes('existed')) {
        Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      } else {
        Alert.alert('Lỗi', msg || 'Không thể tạo người dùng. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} allowFontScaling={false}>Thêm Người dùng</Text>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#0F172A" size="small" />
              : <UserPlus color="#0F172A" size={20} />
            }
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Icon minh hoạ */}
            <View style={styles.iconHeader}>
              <LinearGradient colors={['rgba(251,191,36,0.15)', 'rgba(251,191,36,0.05)']} style={styles.iconCircle}>
                <UserPlus color="#FBBF24" size={40} />
              </LinearGradient>
              <Text style={styles.iconSubtitle} allowFontScaling={false}>Điền thông tin để tạo tài khoản mới</Text>
            </View>

            {/* Tài khoản */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle} allowFontScaling={false}>TÀI KHOẢN <Text style={styles.required}>*</Text></Text>

              <InputField
                label="Tên đăng nhập *"
                value={form.username}
                onChangeText={set('username')}
                placeholder="VD: nguyenvana (≥ 3 ký tự)"
                icon={<UserIcon color="#94A3B8" size={18} />}
              />

              <PasswordField
                label="Mật khẩu *"
                value={form.password}
                onChangeText={set('password')}
                placeholder="Ít nhất 8 ký tự"
              />

              <PasswordField
                label="Xác nhận mật khẩu *"
                value={form.confirmPassword}
                onChangeText={set('confirmPassword')}
                placeholder="Nhập lại mật khẩu"
              />
            </View>

            {/* Thông tin cá nhân */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle} allowFontScaling={false}>THÔNG TIN CÁ NHÂN</Text>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <InputField
                    label="Họ"
                    value={form.firstName}
                    onChangeText={set('firstName')}
                    placeholder="VD: Nguyễn"
                    icon={<UserIcon color="#94A3B8" size={18} />}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Tên"
                    value={form.lastName}
                    onChangeText={set('lastName')}
                    placeholder="VD: Văn A"
                    icon={<UserIcon color="#94A3B8" size={18} />}
                  />
                </View>
              </View>

              <InputField
                label="Email"
                value={form.email}
                onChangeText={set('email')}
                placeholder="email@example.com"
                keyboardType="email-address"
                icon={<Mail color="#94A3B8" size={18} />}
              />

              <InputField
                label="Số điện thoại"
                value={form.phone}
                onChangeText={set('phone')}
                placeholder="09xxx"
                keyboardType="phone-pad"
                icon={<Phone color="#94A3B8" size={18} />}
              />

              <InputField
                label="Địa chỉ"
                value={form.address}
                onChangeText={set('address')}
                placeholder="Nhập địa chỉ..."
                icon={<MapPin color="#94A3B8" size={18} />}
              />
            </View>

            {/* Ghi chú */}
            <View style={styles.noteBox}>
              <Text style={styles.noteText} allowFontScaling={false}>
                💡 Tài khoản mới mặc định được cấp vai trò <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>USER</Text>. Bạn có thể thay đổi vai trò sau khi tạo.
              </Text>
            </View>

            {/* Nút tạo */}
            <TouchableOpacity
              style={[styles.createBtn, saving && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <>
                  <UserPlus color="#0F172A" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.createBtnText} allowFontScaling={false}>TẠO TÀI KHOẢN</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FBBF24',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  iconHeader: { alignItems: 'center', marginVertical: 24 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)',
    marginBottom: 12,
  },
  iconSubtitle: { color: '#64748B', fontSize: 13 },
  section: { marginBottom: 28 },
  sectionTitle: {
    color: '#334155', fontSize: 12, fontWeight: 'bold',
    letterSpacing: 1.5, marginBottom: 16, marginLeft: 4,
  },
  required: { color: '#F43F5E' },
  row: { flexDirection: 'row' },
  inputSection: { marginBottom: 16 },
  inputLabel: { color: '#94A3B8', fontSize: 13, marginBottom: 8, marginLeft: 4 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12, borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 12,
  },
  inputIconWrapper: { marginRight: 12 },
  rightIconWrapper: { marginLeft: 8 },
  input: { flex: 1, height: 48, color: '#F8FAFC', fontSize: 15 },
  noteBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    padding: 14, marginBottom: 24,
  },
  noteText: { color: '#94A3B8', fontSize: 13, lineHeight: 20 },
  createBtn: {
    backgroundColor: '#FBBF24', height: 56, borderRadius: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FBBF24', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  createBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default UserCreateScreen;
