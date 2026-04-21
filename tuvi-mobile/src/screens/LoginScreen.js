import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, User, Lock } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      
      console.log(`Đang đăng nhập user: [${trimmedUsername}]`);
      
      const result = await axiosClient.post('/auth/token', { 
        username: trimmedUsername, 
        password: trimmedPassword 
      });
      
      console.log('>>> [LOGIN] Result:', result);

      if (result && result.token) {
        await AsyncStorage.setItem('token', result.token);
        
        // Cần fetch profile để lấy quyền (Admin/User) trước khi truyền vào context
        const profile = await axiosClient.get('/users/my-info');
        console.log('>>> [LOGIN] Profile fetched:', profile);
        
        console.log('>>> [LOGIN] Invoking auth.login context update');
        auth.login(result.token, profile);
      }
    } catch (error) {
      console.error('>>> [LOGIN] Error Details:', error);
      let message = 'Tên đăng nhập hoặc mật khẩu không đúng.';
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        message = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.';
      } else if (error.detail) {
        message = error.detail;
      } else if (error.message) {
        message = error.message;
      }

      if (Platform.OS === 'web') {
          window.alert(`Lỗi đăng nhập: ${message}`);
      } else {
          Alert.alert('Lỗi đăng nhập', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.title} allowFontScaling={false}>TỬ VI</Text>
          <Text style={styles.subtitle} allowFontScaling={false}>KIẾN GIẢI VẬN MỆNH - ĐỊNH HƯỚNG TƯƠNG LAI</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <User color="#94A3B8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#64748B"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Lock color="#94A3B8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#64748B"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              {showPassword ? <EyeOff color="#94A3B8" size={20} /> : <Eye color="#94A3B8" size={20} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.loginText} allowFontScaling={false}>ĐĂNG NHẬP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FBBF24', // Vàng Gold
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  form: {
    width: '100%',
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
    height: 56,
    color: '#F8FAFC',
    fontSize: 16,
  },
  eyeBtn: {
    padding: 8,
  },
  loginBtn: {
    backgroundColor: '#FBBF24',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  registerLink: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
