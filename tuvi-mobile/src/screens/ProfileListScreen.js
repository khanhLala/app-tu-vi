import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trash2, Calendar, Clock, User as UserIcon } from 'lucide-react-native';
import { getProfiles, deleteProfile, clearHistory } from '../api/profileStorage';

const ProfileListScreen = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfiles = async () => {
    setRefreshing(true);
    const data = await getProfiles();
    setProfiles(data);
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfiles();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id) => {
    Alert.alert(
      'Xóa lịch sử',
      'Bạn có chắc chắn muốn xóa bản ghi này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProfile(id);
            if (success) {
                loadProfiles();
            }
          }
        }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Xóa tất cả',
      'Bạn có muốn xóa toàn bộ lịch sử không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa sạch', 
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            loadProfiles();
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const info = item.personal_info;
    const date = new Date(item.lastSearchTime);
    const timeStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ChartDetail', { chartData: item.full_data })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.nameContainer}>
            <UserIcon color="#FBBF24" size={16} style={styles.icon} />
            <Text style={styles.name} allowFontScaling={false}>{info.name}</Text>
          </View>
          <Text style={styles.timeTag}>{timeStr}</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Calendar color="#94A3B8" size={14} style={styles.icon} />
            <Text style={styles.detailText}>{info.solar_date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock color="#94A3B8" size={14} style={styles.icon} />
            <Text style={styles.detailText}>{info.am_duong_nam_nu}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 color="#EF4444" size={18} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#FBBF24" size={24} />
          </TouchableOpacity>
          <Text style={styles.title} allowFontScaling={false}>LỊCH SỬ LÁ SỐ</Text>
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAll}>Xóa hết</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={profiles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadProfiles} tintColor="#FBBF24" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Chưa có lịch sử lập lá số.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  title: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  clearAll: { color: '#94A3B8', fontSize: 14 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameContainer: { flexDirection: 'row', alignItems: 'center' },
  name: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  timeTag: { color: '#64748B', fontSize: 12 },
  details: { flexDirection: 'row' },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  detailText: { color: '#94A3B8', fontSize: 13, marginLeft: 4 },
  icon: { marginRight: 4 },
  deleteBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 4,
  },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 16 },
});

export default ProfileListScreen;
