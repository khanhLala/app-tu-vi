import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Platform,
  Switch,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  Search, 
  Plus, 
  Edit3, 
  X,
  Mail,
  Phone,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react-native';
import pythonClient from '../../api/pythonClient';

const AdminUserManagerScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const limit = 10;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'user',
    is_active: true
  });

  const fetchUsers = useCallback(async (query = '', pageNum = 0) => {
    setLoading(true);
    try {
      const skip = pageNum * limit;
      const res = await pythonClient.get(`/admin/users?search=${query}&skip=${skip}&limit=${limit}`);
      setUsers(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      const msg = err.detail || 'Không thể lấy danh sách người dùng.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(search, page);
  }, [page]); // Trigger on page change

  const handleSearch = () => {
    setPage(0); // Reset to first page on search
    fetchUsers(search, 0);
  };

  const openForm = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '', // Don't show hashed password
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        is_active: user.is_active ?? true
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'user',
        is_active: true
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.username || (!editingUser && !formData.password)) {
      if (Platform.OS === 'web') alert('Vui lòng nhập đầy đủ Username và Mật khẩu.');
      else Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Username và Mật khẩu.');
      return;
    }

    try {
      if (editingUser) {
        await pythonClient.put(`/admin/users/${editingUser.id}`, formData);
        if (Platform.OS === 'web') alert('Đã cập nhật thông tin người dùng.');
        else Alert.alert('Thành công', 'Đã cập nhật thông tin người dùng.');
      } else {
        await pythonClient.post('/admin/users', formData);
        if (Platform.OS === 'web') alert('Đã tạo người dùng mới.');
        else Alert.alert('Thành công', 'Đã tạo người dùng mới.');
      }
      setModalVisible(false);
      fetchUsers(search, page);
    } catch (err) {
      const msg = err.detail || (typeof err === 'string' ? err : 'Không thể lưu người dùng.');
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Lỗi', msg);
    }
  };

  const handleDeleteUser = (user) => {
    const confirmDelete = async () => {
        try {
            await pythonClient.delete(`/admin/users/${user.id}`);
            if (Platform.OS === 'web') alert('Đã xóa người dùng.');
            else Alert.alert('Thành công', 'Đã xóa người dùng.');
            fetchUsers(search, page);
        } catch (err) {
            const msg = err.detail || 'Không thể xóa người dùng này.';
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('Lỗi', msg);
        }
    };

    if (Platform.OS === 'web') {
        if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn user @${user.username}?`)) {
            confirmDelete();
        }
        return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa vĩnh viễn @${user.username}? Thao tác này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.userCard, !item.is_active && styles.inactiveCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <LinearGradient 
            colors={item.role === 'admin' ? ['#F59E0B', '#D97706'] : ['#64748B', '#475569']} 
            style={styles.avatarGradient}
          >
            <UserIcon color="#FFFFFF" size={24} />
          </LinearGradient>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.first_name || 'Hệ'} {item.last_name || 'Thống'}</Text>
          <Text style={styles.username}>@{item.username}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, item.role === 'admin' && styles.adminBadge]}>
              <Shield size={10} color={item.role === 'admin' ? '#FBBF24' : '#94A3B8'} style={{ marginRight: 4 }} />
              <Text style={[styles.roleText, item.role === 'admin' && styles.adminText]}>{item.role.toUpperCase()}</Text>
            </View>
            {!item.is_active && (
              <View style={styles.statusBadge}>
                <AlertCircle size={10} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.statusText}>BỊ KHÓA</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openForm(item)}>
            <Edit3 color="#FBBF24" size={18} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]} 
            onPress={() => handleDeleteUser(item)}
            disabled={item.username === 'admin'}
          >
            <Trash2 color={item.username === 'admin' ? '#334155' : '#EF4444'} size={18} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        {item.email && (
          <View style={styles.detailItem}>
            <Mail size={12} color="#94A3B8" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        )}
        {item.phone && (
          <View style={styles.detailItem}>
            <Phone size={12} color="#94A3B8" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeft color="#FBBF24" size={24} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>QUẢN LÝ USER</Text>
            <Text style={styles.headerSubtitle}>{total} người dùng trên hệ thống</Text>
          </View>
          <TouchableOpacity onPress={() => openForm()} style={[styles.iconBtn, styles.addBtnHighlight]}>
            <Plus color="#0F172A" size={24} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Search color="#64748B" size={18} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Username, tên, email..."
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); fetchUsers('', 0); }}>
                <X color="#64748B" size={18} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={handleSearch}>
            <Filter color="#FBBF24" size={20} />
          </TouchableOpacity>
        </View>

        {/* USER LIST */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FBBF24" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={users}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AlertCircle color="#1E293B" size={64} style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
                  <TouchableOpacity style={styles.resetBtn} onPress={() => { setSearch(''); setPage(0); fetchUsers('', 0); }}>
                    <Text style={styles.resetBtnText}>Làm mới</Text>
                  </TouchableOpacity>
                </View>
              }
            />
            
            {/* PAGINATION */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity 
                  style={[styles.pageBtn, page === 0 && styles.disabledPageBtn]} 
                  onPress={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft color={page === 0 ? "#334155" : "#FBBF24"} size={20} />
                </TouchableOpacity>
                <Text style={styles.pageInfo}>Trang {page + 1} / {totalPages}</Text>
                <TouchableOpacity 
                  style={[styles.pageBtn, page >= totalPages - 1 && styles.disabledPageBtn]} 
                  onPress={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight color={page >= totalPages - 1 ? "#334155" : "#FBBF24"} size={20} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ADD/EDIT MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{editingUser ? 'Cập nhật User' : 'Thêm User mới'}</Text>
                  <Text style={styles.modalSubtitle}>
                    {editingUser ? `@${editingUser.username}` : 'Nhập thông tin tài khoản'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <X color="#94A3B8" size={24} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username *</Text>
                  <View style={[styles.inputBox, editingUser && styles.disabledInputBox]}>
                    <UserIcon size={18} color="#64748B" style={{ marginRight: 10 }} />
                    <TextInput 
                      style={styles.input} 
                      value={formData.username}
                      onChangeText={t => setFormData({...formData, username: t})}
                      editable={!editingUser}
                      placeholder="vd: nguyenvan_a"
                      placeholderTextColor="#334155"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{editingUser ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu *'}</Text>
                  <View style={styles.inputBox}>
                    <Shield size={18} color="#64748B" style={{ marginRight: 10 }} />
                    <TextInput 
                      style={styles.input} 
                      secureTextEntry
                      value={formData.password}
                      onChangeText={t => setFormData({...formData, password: t})}
                      placeholder={editingUser ? "••••••••" : "Nhập mật khẩu"}
                      placeholderTextColor="#334155"
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Họ</Text>
                        <View style={styles.inputBox}>
                          <TextInput 
                              style={styles.input} 
                              value={formData.first_name}
                              onChangeText={t => setFormData({...formData, first_name: t})}
                              placeholder="Nguyễn"
                              placeholderTextColor="#334155"
                          />
                        </View>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Tên</Text>
                        <View style={styles.inputBox}>
                          <TextInput 
                              style={styles.input} 
                              value={formData.last_name}
                              onChangeText={t => setFormData({...formData, last_name: t})}
                              placeholder="Văn A"
                              placeholderTextColor="#334155"
                          />
                        </View>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputBox}>
                    <Mail size={18} color="#64748B" style={{ marginRight: 10 }} />
                    <TextInput 
                      style={styles.input} 
                      keyboardType="email-address"
                      value={formData.email}
                      onChangeText={t => setFormData({...formData, email: t})}
                      placeholder="example@gmail.com"
                      placeholderTextColor="#334155"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <View style={styles.inputBox}>
                    <Phone size={18} color="#64748B" style={{ marginRight: 10 }} />
                    <TextInput 
                      style={styles.input} 
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={t => setFormData({...formData, phone: t})}
                      placeholder="09xx xxx xxx"
                      placeholderTextColor="#334155"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Quyền hạn (Role)</Text>
                  <View style={styles.roleContainer}>
                    {['user', 'admin'].map(r => (
                        <TouchableOpacity 
                            key={r}
                            style={[styles.roleCard, formData.role === r && styles.selectedRoleCard]}
                            onPress={() => setFormData({...formData, role: r})}
                        >
                            <Shield size={16} color={formData.role === r ? '#FBBF24' : '#64748B'} style={{ marginBottom: 4 }} />
                            <Text style={[styles.roleCardText, formData.role === r && styles.selectedRoleCardText]}>
                              {r === 'admin' ? 'QUẢN TRỊ' : 'NGƯỜI DÙNG'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.statusRow}>
                  <View>
                    <Text style={styles.label}>Trạng thái tài khoản</Text>
                    <Text style={styles.statusDesc}>{formData.is_active ? 'Đang hoạt động bình thường' : 'Tài khoản đang bị khóa'}</Text>
                  </View>
                  <Switch 
                    value={formData.is_active}
                    onValueChange={v => setFormData({...formData, is_active: v})}
                    trackColor={{ false: "#334155", true: "rgba(251, 191, 36, 0.4)" }}
                    thumbColor={formData.is_active ? '#FBBF24' : '#94A3B8'}
                  />
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                  <LinearGradient 
                    colors={['#FBBF24', '#D97706']} 
                    style={styles.saveBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.saveBtnText}>{editingUser ? 'CẬP NHẬT THÔNG TIN' : 'TẠO TÀI KHOẢN MỚI'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  iconBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: 'rgba(30, 41, 59, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  addBtnHighlight: { backgroundColor: '#FBBF24', borderColor: '#FBBF24' },
  headerTitleContainer: { flex: 1 },
  headerTitle: { color: '#FBBF24', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  headerSubtitle: { color: '#64748B', fontSize: 13, marginTop: 2 },
  
  searchSection: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginBottom: 20,
    gap: 12
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 15 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#64748B', marginTop: 15, fontSize: 14 },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  userCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveCard: { opacity: 0.6, borderColor: '#451a1a' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarGradient: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarContainer: { marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { color: '#F8FAFC', fontSize: 17, fontWeight: 'bold' },
  username: { color: '#64748B', fontSize: 14, marginTop: 2 },
  badgeRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  adminBadge: { backgroundColor: 'rgba(251, 191, 36, 0.1)' },
  roleText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  adminText: { color: '#FBBF24' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#EF4444', fontSize: 10, fontWeight: 'bold' },
  
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  editBtn: { borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)' },
  deleteBtn: { borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  
  cardDetails: { 
    marginTop: 15, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: '#334155', 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 15 
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#94A3B8', fontSize: 12 },

  emptyContainer: { alignItems: 'center', marginTop: 100, padding: 40 },
  emptyText: { color: '#64748B', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  resetBtn: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  resetBtnText: { color: '#FBBF24', fontWeight: 'bold' },

  pagination: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 20, 
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  pageBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  disabledPageBtn: { opacity: 0.3 },
  pageInfo: { color: '#F8FAFC', marginHorizontal: 20, fontSize: 14, fontWeight: '500' },

  // MODAL styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#334155' },
  modalTitle: { color: '#FBBF24', fontSize: 22, fontWeight: 'bold' },
  modalSubtitle: { color: '#64748B', fontSize: 14, marginTop: 4 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  modalForm: { padding: 25 },
  inputGroup: { marginBottom: 20 },
  inputRow: { flexDirection: 'row' },
  label: { color: '#94A3B8', fontSize: 13, marginBottom: 8, fontWeight: '600', marginLeft: 4 },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F172A', 
    borderRadius: 16, 
    paddingHorizontal: 15,
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  input: { flex: 1, paddingVertical: 15, color: '#F8FAFC', fontSize: 15 },
  disabledInputBox: { opacity: 0.5, backgroundColor: '#1e293b' },
  
  roleContainer: { flexDirection: 'row', gap: 12 },
  roleCard: { 
    flex: 1, 
    paddingVertical: 15, 
    alignItems: 'center', 
    borderRadius: 16, 
    backgroundColor: '#0F172A', 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  selectedRoleCard: { backgroundColor: 'rgba(251, 191, 36, 0.05)', borderColor: '#FBBF24' },
  roleCardText: { color: '#64748B', fontWeight: 'bold', fontSize: 12, marginTop: 4 },
  selectedRoleCardText: { color: '#FBBF24' },
  
  statusRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 35, 
    backgroundColor: '#0F172A', 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  statusDesc: { color: '#64748B', fontSize: 12, marginTop: 4 },
  
  saveBtn: { marginBottom: 30, borderRadius: 18, overflow: 'hidden', shadowColor: '#FBBF24', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  saveBtnGradient: { paddingVertical: 20, alignItems: 'center' },
  saveBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});

export default AdminUserManagerScreen;

