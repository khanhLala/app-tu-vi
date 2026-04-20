import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Trash2, Package, ShoppingCart, X } from 'lucide-react-native';
import axiosClient from '../../api/axiosClient';

const AdminProductManagerScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '' });

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get('/admin/products');
      setProducts(res);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    try {
      await axiosClient.post('/admin/products', {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      });
      setModalVisible(false);
      setNewProduct({ name: '', description: '', price: '', stock: '', imageUrl: '' });
      fetchProducts();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu vật phẩm.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Xác nhận', 'Xóa vật phẩm này khỏi cửa hàng?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosClient.delete(`/admin/products/${id}`);
            fetchProducts();
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xóa vật phẩm.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <Package color="#64748B" size={40} />
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price?.toLocaleString()} đ</Text>
        <View style={styles.stockBadge}>
          <Text style={styles.stockText}>Tồn kho: {item.stock}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Trash2 color="#EF4444" size={20} />
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
          <Text style={styles.headerTitle}>QUẢN LÝ CỬA HÀNG</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
            <Plus color="#FBBF24" size={24} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FBBF24" />
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thêm vật phẩm mới</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X color="#94A3B8" size={24} />
                </TouchableOpacity>
              </View>
              
              <ScrollView>
                <Text style={styles.label}>Tên vật phẩm *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ví dụ: Vòng tay trầm hương"
                  placeholderTextColor="#475569"
                  value={newProduct.name}
                  onChangeText={txt => setNewProduct({...newProduct, name: txt})}
                />
                
                <Text style={styles.label}>Mô tả</Text>
                <TextInput 
                  style={[styles.input, { height: 100 }]} 
                  multiline
                  placeholder="Mô tả chi tiết vật phẩm..."
                  placeholderTextColor="#475569"
                  value={newProduct.description}
                  onChangeText={txt => setNewProduct({...newProduct, description: txt})}
                />

                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Giá (VNĐ) *</Text>
                        <TextInput 
                            style={styles.input} 
                            keyboardType="numeric"
                            value={String(newProduct.price)}
                            onChangeText={txt => setNewProduct({...newProduct, price: txt})}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Số lượng *</Text>
                        <TextInput 
                            style={styles.input} 
                            keyboardType="numeric"
                            value={String(newProduct.stock)}
                            onChangeText={txt => setNewProduct({...newProduct, stock: txt})}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Link ảnh</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="https://..."
                  placeholderTextColor="#475569"
                  value={newProduct.imageUrl}
                  onChangeText={txt => setNewProduct({...newProduct, imageUrl: txt})}
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>LƯU VẬT PHẨM</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
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
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  headerTitle: { color: '#FBBF24', fontSize: 16, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  addBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  productImageContainer: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  productImage: { width: '100%', height: '100%' },
  productInfo: { flex: 1, marginLeft: 15 },
  productName: { color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' },
  productPrice: { color: '#FBBF24', fontSize: 14, marginTop: 2 },
  stockBadge: { alignSelf: 'flex-start', marginTop: 4 },
  stockText: { color: '#64748B', fontSize: 11 },
  deleteBtn: { padding: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#FBBF24', fontSize: 20, fontWeight: 'bold' },
  label: { color: '#94A3B8', fontSize: 13, marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#0F172A', borderRadius: 12, padding: 12, color: '#F8FAFC', borderWidth: 1, borderColor: '#334155' },
  saveBtn: { backgroundColor: '#FBBF24', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  saveBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default AdminProductManagerScreen;
