import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  ShieldAlert
} from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

const ReportedPostsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING or RESOLVED/DISMISSED
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async (status) => {
    setLoading(true);
    try {
      // Vì backend phân tách PENDING/RESOLVED/DISMISSED, mình sẽ gộp RESOLVED và DISMISSED cho tab "Đã xử lý"
      if (status === 'PENDING') {
        const result = await axiosClient.get('/reports', { params: { status: 'PENDING' } });
        setReports(result);
      } else {
        const resolved = await axiosClient.get('/reports', { params: { status: 'RESOLVED' } });
        const dismissed = await axiosClient.get('/reports', { params: { status: 'DISMISSED' } });
        setReports([...resolved, ...dismissed].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.log('Fetch Reports Error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách báo cáo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports(activeTab);
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports(activeTab);
  }, [activeTab]);

  const handleDismissReport = (reportId) => {
    Alert.alert(
      'Bỏ qua báo cáo',
      'Bạn có chắc chắn muốn bỏ qua báo cáo này? Bài viết vẫn sẽ được giữ lại.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Bỏ qua', 
          onPress: async () => {
            try {
              await axiosClient.put(`/reports/${reportId}/status`, null, { params: { status: 'DISMISSED' } });
              Alert.alert('Thành công', 'Báo cáo đã được bỏ qua.');
              fetchReports(activeTab);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái báo cáo.');
            }
          }
        }
      ]
    );
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.reportCard}
      onPress={() => navigation.navigate('PostDetail', { postId: item.postId, reportId: item.id, reportStatus: item.status })}
    >
      <View style={styles.reportHeader}>
        <View style={styles.statusBadge}>
          <AlertTriangle color={item.status === 'PENDING' ? '#FBBF24' : '#94A3B8'} size={14} />
          <Text style={[styles.statusText, { color: item.status === 'PENDING' ? '#FBBF24' : '#94A3B8' }]}>
            {item.status === 'PENDING' ? 'Đang chờ' : item.status === 'RESOLVED' ? 'Đã xóa' : 'Đã bỏ qua'}
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

      <View style={styles.postPreviewBox}>
        <Text style={styles.postPreviewTitle}>Nội dung bài viết:</Text>
        <Text style={styles.postPreviewText} numberOfLines={2}>{item.postContentPreview}...</Text>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.actionPrompt}>Ấn để xem chi tiết & xử lý</Text>
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
          <Text style={styles.headerTitle} allowFontScaling={false}>Báo cáo Vi phạm</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'PENDING' && styles.activeTabItem]} 
            onPress={() => setActiveTab('PENDING')}
          >
            <Clock color={activeTab === 'PENDING' ? '#FBBF24' : '#64748B'} size={18} />
            <Text style={[styles.tabText, activeTab === 'PENDING' && styles.activeTabText]}>Chưa xử lý</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'RESOLVED' && styles.activeTabItem]} 
            onPress={() => setActiveTab('RESOLVED')}
          >
            <CheckCircle2 color={activeTab === 'RESOLVED' ? '#FBBF24' : '#64748B'} size={18} />
            <Text style={[styles.tabText, activeTab === 'RESOLVED' && styles.activeTabText]}>Đã xử lý</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color="#FBBF24" size="large" />
          </View>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FBBF24" />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <ShieldAlert color="#1E293B" size={64} />
                <Text style={styles.emptyText}>Không có báo cáo nào ở mục này</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabItem: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  tabText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FBBF24',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  reportCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dateText: {
    color: '#64748B',
    fontSize: 12,
  },
  reasonSection: {
    marginBottom: 12,
  },
  reasonLabel: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reasonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reporterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reporterName: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 6,
  },
  postPreviewBox: {
    backgroundColor: '#02061760',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#334155',
    marginBottom: 12,
  },
  postPreviewTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postPreviewText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  actionPrompt: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 16,
  },
});

export default ReportedPostsScreen;
