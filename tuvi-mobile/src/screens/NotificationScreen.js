import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, ChevronLeft, Trash2, CheckCheck, MessageCircle, Heart } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';
import { formatDistanceToNow } from 'date-fns';
import vi from 'date-fns/locale/vi';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await axiosClient.get('/notifications');
      setNotifications(response);
    } catch (error) {
      console.error('Lỗi lấy thông báo:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifications();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id, postId) => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      navigation.navigate('PostDetail', { postId });
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả là đã đọc.');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa thông báo.');
    }
  };

  const deleteAllNotifications = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa tất cả thông báo không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa tất cả', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosClient.delete('/notifications/all');
              setNotifications([]);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa tất cả thông báo.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => markAsRead(item.id, item.postId)}
    >
      <View style={styles.avatarContainer}>
        {item.actorAvatar ? (
          <Image source={{ uri: item.actorAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Bell color="#FBBF24" size={20} />
          </View>
        )}
        <View style={[styles.typeIcon, { backgroundColor: item.type === 'LIKE' ? '#EF4444' : '#3B82F6' }]}>
          {item.type === 'LIKE' ? <Heart color="#FFF" size={10} /> : <MessageCircle color="#FFF" size={10} />}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.message}>
          <Text style={styles.actorName}>{item.actorName}</Text>
          {item.type === 'LIKE' ? ' đã thích bài viết của bạn.' : ' đã bình luận về bài viết của bạn.'}
        </Text>
        <Text style={styles.time}>
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
        </Text>
      </View>

      {!item.isRead && <View style={styles.unreadDot} />}

      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNotification(item.id)}>
        <Trash2 color="#64748B" size={18} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#FBBF24" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>THÔNG BÁO</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn}>
              <CheckCheck color="#FBBF24" size={22} />
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteAllNotifications} style={styles.actionBtn}>
              <Trash2 color="#EF4444" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FBBF24" />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Bell color="#334155" size={60} />
                <Text style={styles.emptyText}>Chưa có thông báo nào.</Text>
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
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  backBtn: { padding: 4 },
  title: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row' },
  actionBtn: { marginLeft: 16, padding: 4 },
  listContent: { paddingBottom: 20 },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1E293B',
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    marginRight: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  content: {
    flex: 1,
  },
  message: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },
  actorName: {
    fontWeight: 'bold',
    color: '#FBBF24',
  },
  time: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 16,
  },
});

export default NotificationScreen;
