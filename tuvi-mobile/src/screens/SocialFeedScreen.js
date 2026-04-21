import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/PostCard';
import ReportModal from '../components/ReportModal';
import SocialCard from '../components/PostCard'; // Wait, it's imported as PostCard
import { Alert, Platform } from 'react-native';

const SocialFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportingPostId, setReportingPostId] = useState(null);
  const [isReporting, setIsReporting] = useState(false);

  const fetchUser = async () => {
    try {
      const result = await axiosClient.get('/users/my-info');
      setCurrentUser(result);
    } catch (e) {
      console.log('Error fetching user for feed permissions');
    }
  };

  const fetchFeed = async () => {
    try {
      const result = await axiosClient.get('/posts');
      if (result) {
        setPosts(result);
      }
    } catch (error) {
      console.error('Lỗi lấy feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    const unsubscribe = navigation.addListener('focus', () => {
      fetchUser();
      fetchFeed();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      unsubscribe();
    };
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const handleLike = async (postId) => {
    try {
      await axiosClient.post(`/posts/${postId}/like`);
      // Update local state to show like immediately
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const newLikedState = !post.isLiked;
            return {
              ...post,
              isLiked: newLikedState,
              likeCount: newLikedState ? post.likeCount + 1 : post.likeCount - 1
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Lỗi like bài viết:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa bài viết này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosClient.delete(`/posts/${postId}`);
              setPosts(prev => prev.filter(p => p.id !== postId));
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa bài viết.');
            }
          }
        }
      ]
    );
  };

  const handleComment = async (postId, content) => {
    try {
      await axiosClient.post(`/posts/${postId}/comments`, { content });
      // Refresh feed to show new comment (or update locally)
      fetchFeed();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi bình luận.');
    }
  };
  
  const handleReport = (postId) => {
    setReportingPostId(postId);
    setReportModalVisible(true);
  };

  const submitReport = async (reason) => {
    setReportModalVisible(false);
    setIsReporting(true);
    try {
      await axiosClient.post(`/posts/${reportingPostId}/report`, { reason });
      if (Platform.OS === 'web') {
        window.alert('Cảm ơn! Báo cáo của bạn đã được gửi cho quản trị viên xử lý.');
      } else {
        Alert.alert('Cảm ơn', 'Báo cáo của bạn đã được gửi cho quản trị viên xử lý.');
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Lỗi: Không thể gửi báo cáo lúc này.');
      } else {
        Alert.alert('Lỗi', 'Không thể gửi báo cáo lúc này.');
      }
    } finally {
      setIsReporting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FBBF24" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title} allowFontScaling={false}>CỘNG ĐỒNG</Text>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              onLike={() => handleLike(item.id)}
              onReport={() => handleReport(item.id)}
              onDelete={() => handleDeletePost(item.id)}
              onComment={handleComment}
              currentUserId={currentUser?.id}
              isAdmin={currentUser?.roles?.some(role => role === 'ADMIN' || role.name === 'ADMIN')}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Chưa có bài đăng nào.</Text>
            </View>
          }
        />

        {!isKeyboardVisible && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Plus color="#0F172A" size={30} />
          </TouchableOpacity>
        )}

        <ReportModal 
          visible={reportModalVisible} 
          onClose={() => setReportModalVisible(false)} 
          onSubmit={submitReport}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  title: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 16, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 16 },
});

export default SocialFeedScreen;
