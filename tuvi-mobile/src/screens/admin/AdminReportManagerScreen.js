import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, AlertTriangle, CheckCircle, Trash2, Eye } from 'lucide-react-native';
import axiosClient from '../../api/axiosClient';

const AdminReportManagerScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/admin/reports?status=${filter}`);
      setReports(res);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleResolve = async (id) => {
    try {
      await axiosClient.post(`/admin/reports/${id}/resolve`);
      setReports(prev => prev.filter(r => r.id !== id));
      Alert.alert('Thành công', 'Đã đánh dấu báo cáo là đã xử lý.');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể xử lý báo cáo.');
    }
  };

  const handleDeletePost = async (postId, reportId) => {
    Alert.alert(
      'Xóa bài viết',
      'Bạn có chắc muốn xóa bài viết vi phạm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosClient.delete(`/posts/${postId}`);
              await axiosClient.post(`/admin/reports/${reportId}/resolve`);
              setReports(prev => prev.filter(r => r.id !== reportId));
              Alert.alert('Thành công', 'Đã xóa bài viết và cập nhật báo cáo.');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa bài viết.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.badge}>
          <AlertTriangle color="#EF4444" size={14} />
          <Text style={styles.badgeText}>{item.reason}</Text>
        </View>
        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      
      <Text style={styles.reporterText}>Người báo: <Text style={{ color: '#F8FAFC' }}>@{item.reporter?.username}</Text></Text>
      
      <View style={styles.postPreview}>
        <Text style={styles.postContent} numberOfLines={3}>"{item.post?.content}"</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.resolveBtn]} 
          onPress={() => handleResolve(item.id)}
        >
          <CheckCircle color="#10B981" size={18} />
          <Text style={styles.resolveText}>Xong</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]} 
          onPress={() => handleDeletePost(item.post?.id, item.id)}
        >
          <Trash2 color="#EF4444" size={18} />
          <Text style={styles.deleteText}>Xóa bài</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#FBBF24" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BÁO CÁO VI PHẠM</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'PENDING' && styles.activeFilter]}
            onPress={() => setFilter('PENDING')}
          >
            <Text style={[styles.filterText, filter === 'PENDING' && styles.activeFilterText]}>Chưa xử lý</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'PROCESSED' && styles.activeFilter]}
            onPress={() => setFilter('PROCESSED')}
          >
            <Text style={[styles.filterText, filter === 'PROCESSED' && styles.activeFilterText]}>Đã xử lý</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FBBF24" />
          </View>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <CheckCircle color="#334155" size={64} />
                <Text style={styles.emptyText}>Tuyệt vời! Không còn báo cáo nào.</Text>
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
  filterContainer: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(30, 41, 59, 0.5)', 
    margin: 20, 
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeFilter: { backgroundColor: '#FBBF24' },
  filterText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  activeFilterText: { color: '#0F172A' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  reportCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#EF4444', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  timeText: { color: '#64748B', fontSize: 11 },
  reporterText: { color: '#94A3B8', fontSize: 13, marginBottom: 10 },
  postPreview: { backgroundColor: '#0F172A', padding: 12, borderRadius: 10, marginBottom: 15 },
  postContent: { color: '#CBD5E1', fontSize: 13, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 8 },
  resolveBtn: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  resolveText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  deleteText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B', fontSize: 16, marginTop: 20 },
});

export default AdminReportManagerScreen;
