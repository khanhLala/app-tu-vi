import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, Trash2, Check, Package, Tag, DollarSign, Type } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axiosClient from '../api/axiosClient';

const ProductEditScreen = ({ route, navigation }) => {
  const { product } = route.params || {};
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || 'Vật Phẩm Phong Thủy');

  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
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
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'product_image.jpg',
      });

      // API upload cloudinary đã được config ở backend
      const response = await axiosClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });


      if (response && response.url) {
        setImageUrl(response.url);
      }
    } catch (error) {
      console.log('Upload Error:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !imageUrl) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên, giá và chọn ảnh sản phẩm.');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name,
        price: parseFloat(price) || 0,
        description,
        category,
        imageUrl,
        type: category === 'Gói xem lá số' ? 'SERVICE' : 'PRODUCT'
      };


      if (isEdit) {
        await axiosClient.put(`/products/${product.id}`, data);
        Alert.alert('Thành công', 'Cập nhật sản phẩm thành công.');
      } else {
        await axiosClient.post('/products', data);
        Alert.alert('Thành công', 'Thêm sản phẩm mới thành công.');
      }
      navigation.goBack();
    } catch (error) {
      console.log('Save Product Error:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin sản phẩm.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving || uploading}>
            {saving ? <ActivityIndicator color="#0F172A" size="small" /> : <Check color="#0F172A" size={24} />}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Image Section */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={uploading}>
              {imageUrl ? (
                <>
                  <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                  <View style={styles.imageOverlay}>
                    <Camera color="#fff" size={24} />
                    <Text style={styles.changePhotoText}>Thay đổi ảnh</Text>
                  </View>
                </>
              ) : (
                <View style={styles.placeholderImage}>
                  {uploading ? (
                    <ActivityIndicator color="#38BDF8" size="large" />
                  ) : (
                    <>
                      <Camera color="#64748B" size={40} />
                      <Text style={styles.placeholderText}>Chọn ảnh sản phẩm</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Form Section */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Package color="#38BDF8" size={16} />
                  <Text style={styles.label}>Tên sản phẩm</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nhập tên sản phẩm..."
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <DollarSign color="#38BDF8" size={16} />
                  <Text style={styles.label}>Giá sản phẩm (VNĐ)</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 150000"
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Tag color="#38BDF8" size={16} />
                  <Text style={styles.label}>Danh mục</Text>
                </View>
                <View style={styles.categoryContainer}>
                  {['Vật Phẩm Phong Thủy', 'Gói xem lá số'].map((cat) => (
                    <TouchableOpacity 
                      key={cat}
                      style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.categoryBtnText, category === cat && styles.categoryBtnTextActive]}>{cat}</Text>
                      {category === cat && <Check color="#0F172A" size={14} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>


              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Type color="#38BDF8" size={16} />
                  <Text style={styles.label}>Mô tả chi tiết</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Nhập mô tả sản phẩm..."
                  placeholderTextColor="#475569"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            </View>
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
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { padding: 20 },
  imagePicker: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  previewImage: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: { color: '#fff', fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#64748B', fontSize: 14, marginTop: 12 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 4 },
  label: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    minHeight: 120,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryBtnActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  categoryBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 4,
  },
  categoryBtnTextActive: {
    color: '#0F172A',
  },
});


export default ProductEditScreen;
