import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Bell } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/PostCard';
import { Alert } from 'react-native';

const SocialFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosClient.get('/notifications');
      const unread = response.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (e) {
      console.log('Error fetching unread count');
    }
  };

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
      fetchUnreadCount();
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
          <View style={{ width: 40 }} />
          <Text style={styles.title} allowFontScaling={false}>CỘNG ĐỒNG</Text>
          <TouchableOpacity 
            style={styles.notificationBtn} 
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell color="#FBBF24" size={24} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              onLike={() => handleLike(item.id)}
              onReport={() => Alert.alert('Thông báo', 'Báo cáo đã được gửi cho quản trị viên!')}
              onDelete={() => handleDeletePost(item.id)}
              onComment={handleComment}
              currentUserId={currentUser?.id}
              isAdmin={currentUser?.roles?.includes('ADMIN')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  notificationBtn: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
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
