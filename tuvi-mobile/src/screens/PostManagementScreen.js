import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  TextInput,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  FileText, 
  Search, 
  ChevronRight, 
  Trash2,
  ArrowLeft,
  User,
  MessageCircle,
  Heart,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const { width } = Dimensions.get('window');

const PostManagementScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  // Main Tabs: POSTS or REPORTS
  const initialTab = route?.params?.initialTab || 'POSTS';

  const [mainTab, setMainTab] = useState(initialTab);

  
  // Reports Sub-Tabs: PENDING or RESOLVED
  const [reportSubTab, setReportSubTab] = useState('PENDING');

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (mainTab === 'POSTS') {
        const result = await axiosClient.get('/posts/admin');
        setPosts(result);
        setFilteredPosts(result);
      } else {
        // Fetch reports based on sub-tab
        if (reportSubTab === 'PENDING') {
          const result = await axiosClient.get('/reports', { params: { status: 'PENDING' } });
          setReports(result);
        } else {
          const resolved = await axiosClient.get('/reports', { params: { status: 'RESOLVED' } });
          const dismissed = await axiosClient.get('/reports', { params: { status: 'DISMISSED' } });
          setReports([...resolved, ...dismissed].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      }
    } catch (error) {
      console.log('Fetch Error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, mainTab, reportSubTab]);



  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [mainTab, reportSubTab]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.content?.toLowerCase().includes(text.toLowerCase()) ||
        post.authorName?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  };

  const handleDeletePost = (postId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài viết này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosClient.delete(`/posts/${postId}`);
              Alert.alert('Thành công', 'Bài viết đã được xóa.');
              fetchData();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa bài viết.');
            }
          }
        }
      ]
    );
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.authorSection}>
          <View style={styles.authorAvatar}>
            <User color="#FBBF24" size={16} />
          </View>
          <Text style={styles.authorName} numberOfLines={1}>{item.authorName}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      
      <Text style={styles.contentPreview} numberOfLines={2}>{item.content}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Heart color="#EF4444" size={14} />
            <Text style={styles.statText}>{item.likeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle color="#38BDF8" size={14} />
            <Text style={styles.statText}>{item.comments?.length || 0}</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => handleDeletePost(item.id)}
          >
            <Trash2 color="#F43F5E" size={18} />
          </TouchableOpacity>
          <ChevronRight color="#334155" size={20} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderReportItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PostDetail', { postId: item.postId, reportId: item.id, reportStatus: item.status })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.statusBadge}>
          <AlertTriangle 
            color={
              item.status === 'PENDING' ? '#FBBF24' : 
              item.status === 'RESOLVED' ? '#EF4444' : 
              '#94A3B8'
            } 
            size={14} 
          />
          <Text style={[
            styles.statusText, 
            { 
              color: item.status === 'PENDING' ? '#FBBF24' : 
                     item.status === 'RESOLVED' ? '#EF4444' : 
                     '#94A3B8' 
            }
          ]}>
            {item.status === 'PENDING' ? 'Đang chờ' : item.status === 'RESOLVED' ? 'Đã xóa' : 'Không xử lý'}
          </Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.reasonSection}>
        <Text style={styles.reasonLabel}>Lý do báo cáo:</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      <View style={styles.reporterSection}>
        <User color="#64748B" size={14} />
        <Text style={styles.reporterName}>Bởi: {item.reporterName} (@{item.reporterUsername})</Text>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.actionPrompt}>Ấn để xử lý</Text>
        <ChevronRight color="#334155" size={20} />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>


        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} allowFontScaling={false}>Quản lý Bài viết</Text>
          <View style={{ width: 40 }} />
        </View>

        {mainTab === 'POSTS' ? (
          /* Search for Posts */
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Search color="#64748B" size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bài viết..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
          </View>
        ) : (
          /* Sub-tabs for Reports */
          <View style={styles.subTabBar}>
            <TouchableOpacity 
              style={[styles.subTabItem, reportSubTab === 'PENDING' && styles.activeSubTab]} 
              onPress={() => setReportSubTab('PENDING')}
            >
              <Clock color={reportSubTab === 'PENDING' ? '#FBBF24' : '#64748B'} size={16} />
              <Text style={[styles.subTabText, reportSubTab === 'PENDING' && styles.activeSubTabText]}>Chưa xử lý</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.subTabItem, reportSubTab === 'RESOLVED' && styles.activeSubTab]} 
              onPress={() => setReportSubTab('RESOLVED')}
            >
              <CheckCircle2 color={reportSubTab === 'RESOLVED' ? '#FBBF24' : '#64748B'} size={16} />
              <Text style={[styles.subTabText, reportSubTab === 'RESOLVED' && styles.activeSubTabText]}>Đã xử lý</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color="#FBBF24" size="large" />
          </View>
        ) : (
          <FlatList
            data={mainTab === 'POSTS' ? filteredPosts : reports}
            renderItem={mainTab === 'POSTS' ? renderPostItem : renderReportItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                {mainTab === 'POSTS' ? <FileText color="#1E293B" size={64} /> : <ShieldAlert color="#1E293B" size={64} />}
                <Text style={styles.emptyText}>Không tìm thấy dữ liệu</Text>
              </View>
            }
          />
        )}

        {/* Custom Bottom Navigation Bar */}
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setMainTab('POSTS')}
          >
            <FileText color={mainTab === 'POSTS' ? '#FBBF24' : '#64748B'} size={24} />
            <Text style={[styles.navText, mainTab === 'POSTS' && styles.activeNavText]}>Bài viết</Text>
            {mainTab === 'POSTS' && <View style={styles.navIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setMainTab('REPORTS')}
          >
            <AlertTriangle color={mainTab === 'REPORTS' ? '#FBBF24' : '#64748B'} size={24} />
            <Text style={[styles.navText, mainTab === 'REPORTS' && styles.activeNavText]}>Báo cáo</Text>
            {mainTab === 'REPORTS' && <View style={styles.navIndicator} />}
          </TouchableOpacity>
        </View>
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
  searchSection: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B80',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 14 },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subTabItem: {
    flex: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSubTab: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  subTabText: { color: '#64748B', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  activeSubTabText: { color: '#FBBF24' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#1E293B',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  authorSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorName: { color: '#F8FAFC', fontSize: 14, fontWeight: 'bold' },
  dateText: { color: '#64748B', fontSize: 12 },
  contentPreview: { color: '#CBD5E1', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  statsRow: { flexDirection: 'row' },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { color: '#94A3B8', fontSize: 12, marginLeft: 4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  deleteBtn: { padding: 6, marginRight: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  reasonSection: { marginBottom: 10 },
  reasonLabel: { color: '#FBBF24', fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  reasonText: { color: '#F8FAFC', fontSize: 14, fontWeight: 'bold' },
  reporterSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reporterName: { color: '#94A3B8', fontSize: 11, marginLeft: 6 },
  actionPrompt: { color: '#64748B', fontSize: 11, fontStyle: 'italic' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B', fontSize: 16, marginTop: 16 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },

  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navText: { fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: 'bold' },
  activeNavText: { color: '#FBBF24' },
  navIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 3,
    backgroundColor: '#FBBF24',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});

export default PostManagementScreen;
