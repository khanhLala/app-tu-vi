import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  TextInput,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  Search, 
  ChevronRight, 
  User as UserIcon, 
  Shield, 
  ShieldAlert,
  Trash2,
  ArrowLeft
} from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const result = await axiosClient.get('/users');
      setUsers(result);
      setFilteredUsers(result);
    } catch (error) {
      console.log('Fetch Users Error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username?.toLowerCase().includes(text.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(text.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(text.toLowerCase()) ||
        user.email?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleDeleteUser = (userId, username) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa người dùng "${username}"? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosClient.delete(`/users/${userId}`);
              Alert.alert('Thành công', 'Người dùng đã được xóa.');
              fetchUsers(); // Tải lại danh sách
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa người dùng.');
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => {
    const isAdmin = item.roles?.includes('ADMIN');
    
    return (
      <TouchableOpacity 
        style={styles.userCard}
        onPress={() => navigation.navigate('UserEdit', { userId: item.id })}
      >
        <View style={[styles.avatarWrapper, { backgroundColor: isAdmin ? 'rgba(251, 191, 36, 0.1)' : 'rgba(148, 163, 184, 0.1)' }]}>
          {isAdmin ? <Shield color="#FBBF24" size={24} /> : <UserIcon color="#94A3B8" size={24} />}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.username} allowFontScaling={false}>{item.username}</Text>
          <Text style={styles.fullName} allowFontScaling={false}>
            {item.firstName || ''} {item.lastName || ''}
            {(!item.firstName && !item.lastName) && 'Chưa cập nhật tên'}
          </Text>
          <View style={styles.roleTagContainer}>
            {item.roles?.map(role => (
              <View key={role} style={[styles.roleTag, { backgroundColor: role === 'ADMIN' ? '#FBBF2420' : '#38BDF820' }]}>
                <Text style={[styles.roleText, { color: role === 'ADMIN' ? '#FBBF24' : '#38BDF8' }]} allowFontScaling={false}>
                  {role}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDeleteUser(item.id, item.username)}
        >
          <Trash2 color="#F43F5E" size={20} />
        </TouchableOpacity>
        
        <ChevronRight color="#334155" size={20} />
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} allowFontScaling={false}>Quản lý Người dùng</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search color="#64748B" size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm theo username, tên, email..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color="#FBBF24" size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Users color="#1E293B" size={64} />
                <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
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
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B80',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#1E293B',
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullName: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  roleTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: 10,
    marginRight: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 16,
  },
});

export default UserManagementScreen;
