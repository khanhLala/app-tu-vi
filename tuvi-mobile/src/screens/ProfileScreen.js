import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, MapPin, Calendar, Shield, ChevronLeft, Edit3 } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await axiosClient.get('/users/my-info');
      setProfile(response);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân.');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      // Kiểm tra nếu date hợp lệ
      if (isNaN(date.getTime())) return dateString; // Trả về gốc nếu k parse đc
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{label === 'Ngày sinh' ? formatDate(value) : (value || 'Chưa cập nhật')}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FBBF24" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>THÔNG TIN CÁ NHÂN</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditProfile', { profile })} 
            style={styles.editBtn}
          >
            <Edit3 color="#FBBF24" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <User color="#FBBF24" size={60} />
              )}
            </View>
            <Text style={styles.nameText}>
              {`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || profile?.username}
            </Text>
            <Text style={styles.roleText}>
              {profile?.roles?.join(', ') || 'Người dùng'}
            </Text>
          </View>

          <View style={styles.detailsCard}>
            <InfoItem 
              icon={<User color="#94A3B8" size={20} />} 
              label="Tên đăng nhập" 
              value={profile?.username} 
            />
            <InfoItem 
              icon={<Mail color="#94A3B8" size={20} />} 
              label="Email" 
              value={profile?.email} 
            />
            <InfoItem 
              icon={<Phone color="#94A3B8" size={20} />} 
              label="Số điện thoại" 
              value={profile?.phone} 
            />
            <InfoItem 
              icon={<Calendar color="#94A3B8" size={20} />} 
              label="Ngày sinh" 
              value={profile?.dob} 
            />
            <InfoItem 
              icon={<MapPin color="#94A3B8" size={20} />} 
              label="Địa chỉ" 
              value={profile?.address} 
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
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
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FBBF24', letterSpacing: 2 },
  editBtn: { padding: 4 },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC' },
  roleText: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  detailsCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#F8FAFC', fontWeight: '500' },
});

export default ProfileScreen;
