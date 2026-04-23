import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/PostCard';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId, reportId, reportStatus } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = async () => {
    try {
      const [postResult, userResult] = await Promise.all([
        axiosClient.get(`/posts/${postId}`),
        axiosClient.get('/users/my-info')
      ]);
      setPost(postResult);
      setCurrentUser(userResult);
    } catch (error) {
      console.log('Fetch Post Detail Error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin bài viết.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  const handleDeletePost = async () => {
    Alert.alert(
      'Xác nhận xóa bài viết',
      'Bạn có chắc chắn muốn xóa bài viết này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            setProcessing(true);
            try {
              // Soft delete: backend đánh dấu isDeleted=true và tự động RESOLVED các báo cáo
              await axiosClient.delete(`/posts/${postId}`);
              Alert.alert('Thành công', 'Bài viết đã được ẩn và các báo cáo đã được xử lý.');
              navigation.goBack();
            } catch (error) {
              console.log('Delete post error:', error);
              Alert.alert('Lỗi', 'Không thể xóa bài viết. Vui lòng thử lại.');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleDismissReport = async () => {
    setProcessing(true);
    try {
      await axiosClient.put(`/reports/${reportId}/status`, null, { params: { status: 'DISMISSED' } });
      Alert.alert('Thành công', 'Báo cáo đã được bỏ qua.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật báo cáo.');
    } finally {
      setProcessing(false);
    }
  };

  const handleLike = async () => {
    try {
      await axiosClient.post(`/posts/${postId}/like`);
      fetchData(); // Reload
    } catch (e) {}
  };

  const handleComment = async (id, content) => {
    try {
      await axiosClient.post(`/posts/${id}/comments`, { content });
      fetchData(); // Reload
    } catch (e) {}
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FBBF24" size="large" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} allowFontScaling={false}>Chi tiết Bài viết</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {post && (
            <PostCard 
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDeletePost}
              currentUserId={currentUser?.id}
              isAdmin={currentUser?.roles?.includes('ADMIN')}
            />
          )}

          {/* Admin Moderation Actions (Only if coming from a report and it's PENDING) */}
          {reportId && reportStatus === 'PENDING' && (
            <View style={styles.moderationCard}>
              <View style={styles.moderationHeader}>
                <ShieldAlert color="#FBBF24" size={20} />
                <Text style={styles.moderationTitle}>XỬ LÝ VI PHẠM</Text>
              </View>
              
              <View style={styles.moderationActions}>
                <TouchableOpacity 
                  style={[styles.modBtn, styles.dismissBtn]} 
                  onPress={handleDismissReport}
                  disabled={processing}
                >
                  <CheckCircle2 color="#94A3B8" size={20} />
                  <Text style={styles.dismissText}>Bỏ qua báo cáo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modBtn, styles.deleteBtn]} 
                  onPress={handleDeletePost}
                  disabled={processing}
                >
                  <Trash2 color="#0F172A" size={20} />
                  <Text style={styles.deleteText}>Xóa bài viết</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  moderationCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FBBF2440',
  },
  moderationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moderationTitle: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
  moderationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modBtn: {
    flex: 0.48,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissBtn: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 1,
    borderColor: '#334155',
  },
  deleteBtn: {
    backgroundColor: '#F43F5E',
  },
  dismissText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PostDetailScreen;
