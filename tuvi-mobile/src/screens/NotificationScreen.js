import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, ArrowLeft, Heart, MessageCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';
import { useNotifications } from '../context/NotificationContext';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUnreadCount } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axiosClient.get('/notifications');
      setNotifications(res);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axiosClient.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      refreshUnreadCount();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => {
        handleMarkAsRead(item.id);
        // Navigate logic can be added here if we have a PostDetail screen
      }}
    >
      <View style={styles.iconContainer}>
        {item.type === 'LIKE' ? (
          <Heart color="#EF4444" size={20} fill="#EF4444" />
        ) : (
          <MessageCircle color="#3B82F6" size={20} fill="#3B82F6" />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.senderName}>{item.senderName}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#FBBF24" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FBBF24" style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} tintColor="#FBBF24" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Bell color="#334155" size={64} />
                <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
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
  headerTitle: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 10 },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    marginBottom: 10,
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderLeftWidth: 4,
    borderLeftColor: '#FBBF24',
  },
  iconContainer: { marginRight: 15 },
  textContainer: { flex: 1 },
  senderName: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 14 },
  message: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  time: { color: '#64748B', fontSize: 11, marginTop: 5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FBBF24' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: '#64748B', marginTop: 15, fontSize: 16 },
});

export default NotificationScreen;
