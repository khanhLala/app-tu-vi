import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Bell, Shield, CircleHelp, LogOut, ChevronRight, Camera } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const SettingsScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await axiosClient.get('/users/my-info');
      setProfile(response);
    } catch (error) {
      console.log('Error fetching settings profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    if (window.location) window.location.reload();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'App cần quyền truy cập thư viện ảnh để đổi avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    if (!uri) return;

    setUploading(true);
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts.length > 0 ? uriParts[uriParts.length - 1] : 'jpg';

    formData.append('file', {
      uri,
      name: `avatar.${fileType}`,
      type: `image/${fileType}`,
    });

    try {
      const response = await axiosClient.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfile(response);
      Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật!');
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const SettingItem = ({ icon, label, onPress, type = 'link' }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.itemLabel} allowFontScaling={false}>{label}</Text>
      </View>
      {type === 'link' ? <ChevronRight color="#64748B" size={20} /> : <Switch value={true} trackColor={{ false: '#334155', true: '#FBBF24' }} />}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title} allowFontScaling={false}>CÀI ĐẶT</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.avatarContainer} 
              onPress={pickImage}
              disabled={uploading}
            >
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User color="#FBBF24" size={40} />
                </View>
              )}
              {uploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color="#FBBF24" />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Camera color="#0F172A" size={12} />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} allowFontScaling={false}>{profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username : '...'}</Text>
              <Text style={styles.profileEmail}>{profile ? `ID: ${profile.id.substring(0, 8)}` : 'Đang tải...'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
            <SettingItem 
              icon={<User color="#94A3B8" size={20} />} 
              label="Thông tin cá nhân" 
              onPress={() => navigation.navigate('Profile')}
            />
            <SettingItem 
              icon={<Shield color="#94A3B8" size={20} />} 
              label="Bảo mật & Mật khẩu" 
              onPress={() => navigation.navigate('Security')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ỨNG DỤNG</Text>
            <SettingItem icon={<Bell color="#94A3B8" size={20} />} label="Thông báo" type="switch" />
            <SettingItem 
              icon={<CircleHelp color="#94A3B8" size={20} />} 
              label="Hỗ trợ & Góp ý" 
              onPress={() => navigation.navigate('Support')}
            />
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut color="#EF4444" size={20} />
            <Text style={styles.logoutText} allowFontScaling={false}>Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingTop: 10, paddingBottom: 20, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FBBF24' },
  scrollContent: { padding: 20 },
  profileSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 20, padding: 20, marginBottom: 30 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', position: 'relative' },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: 'rgba(251, 191, 36, 0.1)', justifyContent: 'center', alignItems: 'center' },
  uploadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FBBF24', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E293B' },
  profileInfo: { flexShrink: 1, flexGrow: 1, marginLeft: 16, marginRight: 8 },
  profileName: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  profileEmail: { color: '#94A3B8', fontSize: 14, marginTop: 2 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 16, borderRadius: 16, marginBottom: 8 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { marginRight: 12 },
  itemLabel: { color: '#F8FAFC', fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, padding: 16 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});

export default SettingsScreen;
