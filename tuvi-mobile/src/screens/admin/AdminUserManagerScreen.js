import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trash2, Shield, User as UserIcon, Search } from 'lucide-react-native';
import axiosClient from '../../api/axiosClient';

const AdminUserManagerScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/admin/users');
      setUsers(res);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (userId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa vĩnh viễn người dùng này? Thao tác này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosClient.delete(`/admin/users/${userId}`);
              setUsers(prev => prev.filter(u => u.id !== userId));
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa người dùng này.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.avatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserIcon color="#FBBF24" size={20} />
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.username}>@{item.username}</Text>
        <View style={styles.roleContainer}>
          {item.roles?.map(role => (
            <View key={role} style={[styles.roleBadge, role === 'ADMIN' && styles.adminBadge]}>
                <Text style={[styles.roleText, role === 'ADMIN' && styles.adminText]}>{role}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDeleteUser(item.id)}
        disabled={item.username === 'admin'} // Can't delete main admin
      >
        <Trash2 color={item.username === 'admin' ? '#334155' : '#EF4444'} size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#FBBF24" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QUẢN LÝ NGƯỜI DÙNG</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Search color="#64748B" size={20} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm người dùng...</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FBBF24" />
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có người dùng nào</Text>
              </View>
            }
          />
        )}
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
  headerTitle: { color: '#FBBF24', fontSize: 16, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    margin: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: { marginRight: 10 },
  searchPlaceholder: { color: '#64748B', fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', marginRight: 15 },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: 'rgba(251, 191, 36, 0.1)', justifyContent: 'center', alignItems: 'center' },
  userInfo: { flex: 1 },
  userName: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  username: { color: '#64748B', fontSize: 13, marginTop: 2 },
  roleContainer: { flexDirection: 'row', marginTop: 6, gap: 5 },
  roleBadge: { backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  adminBadge: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  roleText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  adminText: { color: '#EF4444' },
  deleteBtn: { padding: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B', fontSize: 16 },
});

export default AdminUserManagerScreen;
