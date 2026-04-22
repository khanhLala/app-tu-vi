import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput, RefreshControl, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Search, User, UserPlus, Trash2, Edit3, Shield, Mail, Phone } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    roles: ['USER']
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addFormData, setAddFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    roles: ['USER']
  });
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await axiosClient.get('/users');
      setUsers(data);
    } catch (error) {
      console.log('Fetch Users Error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleEditPress = (user) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      password: '',
      roles: user.roles || ['USER']
    });
    setEditModalVisible(true);
  };

  const handleUpdateUser = async () => {
    if (!editFormData.firstName || !editFormData.lastName) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống');
      return;
    }

    setUpdating(true);
    try {
      const updatedUser = await axiosClient.put(`/users/${editingUser.id}`, editFormData);
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin người dùng');
    } catch (error) {
      console.log('Update User Error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin người dùng');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddUser = async () => {
    if (!addFormData.username || !addFormData.password || !addFormData.firstName || !addFormData.lastName) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    setUpdating(true);
    try {
      const newUser = await axiosClient.post('/users', addFormData);
      setUsers([newUser, ...users]);
      setAddModalVisible(false);
      setAddFormData({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        roles: ['USER']
      });
      Alert.alert('Thành công', 'Đã thêm người dùng mới');
    } catch (error) {
      console.log('Add User Error:', error);
      const errorMsg = error.message || 'Không thể thêm người dùng';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = (userId, username) => {
    if (username === 'admin') {
      Alert.alert('Thông báo', 'Không thể xóa tài khoản Admin hệ thống');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa người dùng "${username}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosClient.delete(`/users/${userId}`);
              setUsers(users.filter(u => u.id !== userId));
              Alert.alert('Thành công', 'Đã xóa người dùng');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa người dùng');
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(user => 
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserCard = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <User color="#94A3B8" size={24} />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.userName} numberOfLines={1}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.userHandle} numberOfLines={1}>@{item.username}</Text>
          </View>
        </View>
        <View style={styles.roleBadge}>
          <Shield color="#FBBF24" size={12} />
          <Text style={styles.roleText}>{item.roles?.includes('ADMIN') ? 'ADMIN' : 'USER'}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        {item.email && (
          <View style={styles.contactItem}>
            <Mail color="#64748B" size={14} />
            <Text style={styles.contactText}>{item.email}</Text>
          </View>
        )}
        {item.phone && (
          <View style={styles.contactItem}>
            <Phone color="#64748B" size={14} />
            <Text style={styles.contactText}>{item.phone}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.editBtn]} 
          onPress={() => handleEditPress(item)}
        >
          <Edit3 color="#38BDF8" size={18} />
          <Text style={styles.editBtnText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]} 
          onPress={() => handleDeleteUser(item.id, item.username)}
        >
          <Trash2 color="#EF4444" size={18} />
          <Text style={styles.deleteBtnText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#F8FAFC" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Người dùng</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
            <UserPlus color="#FBBF24" size={24} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search color="#64748B" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm theo tên, username, email..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
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
            keyExtractor={item => item.id}
            renderItem={({ item }) => <UserCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
              </View>
            }
          />
        )}

        {/* Edit User Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.closeBtn}>Đóng</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Họ</Text>
                  <TextInput
                    style={styles.input}
                    value={editFormData.firstName}
                    onChangeText={(val) => setEditFormData({...editFormData, firstName: val})}
                    placeholder="Nhập họ..."
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tên</Text>
                  <TextInput
                    style={styles.input}
                    value={editFormData.lastName}
                    onChangeText={(val) => setEditFormData({...editFormData, lastName: val})}
                    placeholder="Nhập tên..."
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={editFormData.email}
                    onChangeText={(val) => setEditFormData({...editFormData, email: val})}
                    placeholder="Nhập email..."
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    value={editFormData.phone}
                    onChangeText={(val) => setEditFormData({...editFormData, phone: val})}
                    placeholder="Nhập số điện thoại..."
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Địa chỉ</Text>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    value={editFormData.address}
                    onChangeText={(val) => setEditFormData({...editFormData, address: val})}
                    placeholder="Nhập địa chỉ..."
                    placeholderTextColor="#64748B"
                    multiline={true}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Mật khẩu mới (để trống nếu không đổi)</Text>
                  <TextInput
                    style={styles.input}
                    value={editFormData.password}
                    onChangeText={(val) => setEditFormData({...editFormData, password: val})}
                    placeholder="Nhập mật khẩu mới..."
                    placeholderTextColor="#64748B"
                    secureTextEntry={true}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Vai trò (Role)</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity 
                      style={[styles.roleOption, editFormData.roles.includes('USER') && styles.roleOptionActive]}
                      onPress={() => setEditFormData({...editFormData, roles: ['USER']})}
                    >
                      <Text style={[styles.roleOptionText, editFormData.roles.includes('USER') && styles.roleOptionTextActive]}>USER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.roleOption, editFormData.roles.includes('ADMIN') && styles.roleOptionActive]}
                      onPress={() => setEditFormData({...editFormData, roles: ['ADMIN']})}
                    >
                      <Text style={[styles.roleOptionText, editFormData.roles.includes('ADMIN') && styles.roleOptionTextActive]}>ADMIN</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.saveBtn} 
                  onPress={handleUpdateUser}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#0F172A" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Add User Modal */}
        <Modal
          visible={addModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thêm người dùng mới</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                  <Text style={styles.closeBtn}>Đóng</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tên đăng nhập *</Text>
                  <TextInput
                    style={styles.input}
                    value={addFormData.username}
                    onChangeText={(val) => setAddFormData({...addFormData, username: val})}
                    placeholder="Nhập username..."
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Mật khẩu *</Text>
                  <TextInput
                    style={styles.input}
                    value={addFormData.password}
                    onChangeText={(val) => setAddFormData({...addFormData, password: val})}
                    placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)..."
                    placeholderTextColor="#64748B"
                    secureTextEntry={true}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Họ *</Text>
                    <TextInput
                      style={styles.input}
                      value={addFormData.firstName}
                      onChangeText={(val) => setAddFormData({...addFormData, firstName: val})}
                      placeholder="Họ..."
                      placeholderTextColor="#64748B"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Tên *</Text>
                    <TextInput
                      style={styles.input}
                      value={addFormData.lastName}
                      onChangeText={(val) => setAddFormData({...addFormData, lastName: val})}
                      placeholder="Tên..."
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={addFormData.email}
                    onChangeText={(val) => setAddFormData({...addFormData, email: val})}
                    placeholder="Nhập email..."
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    value={addFormData.phone}
                    onChangeText={(val) => setAddFormData({...addFormData, phone: val})}
                    placeholder="Nhập số điện thoại..."
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Vai trò (Role)</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity 
                      style={[styles.roleOption, addFormData.roles.includes('USER') && styles.roleOptionActive]}
                      onPress={() => setAddFormData({...addFormData, roles: ['USER']})}
                    >
                      <Text style={[styles.roleOptionText, addFormData.roles.includes('USER') && styles.roleOptionTextActive]}>USER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.roleOption, addFormData.roles.includes('ADMIN') && styles.roleOptionActive]}
                      onPress={() => setAddFormData({...addFormData, roles: ['ADMIN']})}
                    >
                      <Text style={[styles.roleOptionText, addFormData.roles.includes('ADMIN') && styles.roleOptionTextActive]}>ADMIN</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.saveBtn, { backgroundColor: '#10B981', shadowColor: '#10B981' }]} 
                  onPress={handleAddUser}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#F8FAFC" size="small" />
                  ) : (
                    <Text style={[styles.saveBtnText, { color: '#F8FAFC' }]}>Tạo người dùng</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
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
    paddingVertical: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold' },
  addBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: { flex: 1, color: '#F8FAFC', marginLeft: 10, fontSize: 14 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  userCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: { marginLeft: 12, flex: 1 },
  userName: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  userHandle: { color: '#64748B', fontSize: 13, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  roleText: { color: '#FBBF24', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  cardBody: { marginTop: 12, paddingLeft: 60 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  contactText: { color: '#94A3B8', fontSize: 13, marginLeft: 8 },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
  },
  editBtn: { backgroundColor: 'rgba(56, 189, 248, 0.1)', marginRight: 8 },
  editBtnText: { color: '#38BDF8', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  deleteBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#64748B', fontSize: 14 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  formGroup: { marginBottom: 20 },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleOption: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  roleOptionActive: {
    backgroundColor: '#FBBF24',
  },
  roleOptionText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  roleOptionTextActive: {
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#FBBF24',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default UserManagementScreen;
