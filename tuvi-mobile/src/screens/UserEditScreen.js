import React, { useState, useEffect } from 'react';
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
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Save, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  CheckCircle2
} from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const UserEditScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    roles: []
  });

  const fetchUserDetail = async () => {
    try {
      const result = await axiosClient.get(`/users/${userId}`);
      setUserData(result);
    } catch (error) {
      console.log('Fetch User Detail Error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axiosClient.put(`/users/${userId}`, userData);
      Alert.alert('Thành công', 'Thông tin người dùng đã được cập nhật.');
      navigation.goBack();
    } catch (error) {
      console.log('Update User Error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin người dùng.');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (roleName) => {
    setUserData(prev => {
      const currentRoles = [...prev.roles];
      const index = currentRoles.indexOf(roleName);
      if (index > -1) {
        // Don't allow removing all roles? Or at least keep one.
        if (currentRoles.length > 1) {
          currentRoles.splice(index, 1);
        } else {
          Alert.alert('Thông báo', 'Người dùng phải có ít nhất một vai trò.');
          return prev;
        }
      } else {
        currentRoles.push(roleName);
      }
      return { ...prev, roles: currentRoles };
    });
  };

  const InputField = ({ icon, label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel} allowFontScaling={false}>{label}</Text>
      <View style={styles.inputGroup}>
        <View style={styles.inputIconWrapper}>
          {icon}
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FBBF24" size="large" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} allowFontScaling={false}>Chỉnh sửa Người dùng</Text>
          <TouchableOpacity 
            style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#0F172A" size="small" /> : <Save color="#0F172A" size={20} />}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* User Header Info */}
            <View style={styles.userHeader}>
              <View style={styles.avatarLarge}>
                <UserIcon color="#FBBF24" size={40} />
              </View>
              <Text style={styles.usernameText} allowFontScaling={false}>@{userData.username}</Text>
              <Text style={styles.userIdText} allowFontScaling={false}>ID: {userId}</Text>
            </View>

            {/* Basic Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle} allowFontScaling={false}>THÔNG TIN CƠ BẢN</Text>
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <InputField 
                    label="Họ"
                    value={userData.firstName}
                    onChangeText={(text) => setUserData({...userData, firstName: text})}
                    placeholder="VD: Nguyễn"
                    icon={<UserIcon color="#94A3B8" size={18} />}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField 
                    label="Tên"
                    value={userData.lastName}
                    onChangeText={(text) => setUserData({...userData, lastName: text})}
                    placeholder="VD: Văn A"
                    icon={<UserIcon color="#94A3B8" size={18} />}
                  />
                </View>
              </View>

              <InputField 
                label="Email"
                value={userData.email}
                onChangeText={(text) => setUserData({...userData, email: text})}
                placeholder="email@example.com"
                keyboardType="email-address"
                icon={<Mail color="#94A3B8" size={18} />}
              />

              <InputField 
                label="Số điện thoại"
                value={userData.phone}
                onChangeText={(text) => setUserData({...userData, phone: text})}
                placeholder="09xxx"
                keyboardType="phone-pad"
                icon={<Phone color="#94A3B8" size={18} />}
              />

              <InputField 
                label="Địa chỉ"
                value={userData.address}
                onChangeText={(text) => setUserData({...userData, address: text})}
                placeholder="Nhập địa chỉ..."
                icon={<MapPin color="#94A3B8" size={18} />}
              />
            </View>

            {/* Roles Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle} allowFontScaling={false}>VAI TRÒ & QUYỀN HẠN</Text>
              
              <TouchableOpacity 
                style={styles.roleItem}
                onPress={() => toggleRole('USER')}
              >
                <View style={styles.roleInfo}>
                  <View style={[styles.roleIcon, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                    <UserIcon color="#38BDF8" size={20} />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.roleName} allowFontScaling={false}>Người dùng (USER)</Text>
                    <Text style={styles.roleDesc} allowFontScaling={false}>Quyền cơ bản của hệ thống</Text>
                  </View>
                </View>
                {userData.roles.includes('USER') && <CheckCircle2 color="#FBBF24" size={24} />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.roleItem}
                onPress={() => toggleRole('ADMIN')}
              >
                <View style={styles.roleInfo}>
                  <View style={[styles.roleIcon, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
                    <Shield color="#FBBF24" size={20} />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.roleName} allowFontScaling={false}>Quản trị viên (ADMIN)</Text>
                    <Text style={styles.roleDesc} allowFontScaling={false}>Toàn quyền quản lý hệ thống</Text>
                  </View>
                </View>
                {userData.roles.includes('ADMIN') && <CheckCircle2 color="#FBBF24" size={24} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.fullSaveBtn, saving && { opacity: 0.7 }]}
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <>
                  <Save color="#0F172A" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.fullSaveText} allowFontScaling={false}>LƯU THAY ĐỔI</Text>
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
  loadingContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    marginBottom: 12,
  },
  usernameText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userIdText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#334155',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
  },
  inputIconWrapper: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#F8FAFC',
    fontSize: 15,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#1E293B',
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  roleDesc: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  fullSaveBtn: {
    backgroundColor: '#FBBF24',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fullSaveText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserEditScreen;
