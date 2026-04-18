import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Send, Paperclip, FileText, X, CircleHelp } from 'lucide-react-native';
import * as MailComposer from 'expo-mail-composer';
import * as DocumentPicker from 'expo-document-picker';

const SupportScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachment(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn file.');
    }
  };

  const handleSendFeedback = async () => {
    if (!title || !content) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và nội dung góp ý.');
      return;
    }

    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Lỗi', 'Ứng dụng Email không khả dụng trên thiết bị này.');
      return;
    }

    setLoading(true);
    try {
      const options = {
        recipients: ['khanhdangquoc36@gmail.com'],
        subject: `[Tử Vi App - Góp ý] ${title}`,
        body: content,
      };

      if (attachment) {
        options.attachments = [attachment.uri];
      }

      await MailComposer.composeAsync(options);

      Alert.alert('Thông báo', 'Gửi góp ý thành công!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể mở trình soạn thảo Email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>HỖ TRỢ & GÓP Ý</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoBox}>
            <CircleHelp color="#FBBF24" size={32} />
            <Text style={styles.infoTitle}>Gửi phản hồi</Text>
            <Text style={styles.infoDesc}>Ý kiến của bạn giúp chúng tôi hoàn thiện ứng dụng tốt hơn mỗi ngày.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiêu đề</Text>
              <TextInput
                style={styles.singleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Ví dụ: Lỗi hiển thị lá số, Góp ý tính năng mới..."
                placeholderTextColor="#334155"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nội dung góp ý</Text>
              <TextInput
                style={styles.multiInput}
                value={content}
                onChangeText={setContent}
                placeholder="Mô tả chi tiết góp ý của bạn tại đây..."
                placeholderTextColor="#334155"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>File đính kèm (Ảnh, tài liệu...)</Text>
              {attachment ? (
                <View style={styles.attachmentPreview}>
                  <FileText color="#FBBF24" size={20} />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <TouchableOpacity onPress={() => setAttachment(null)}>
                    <X color="#EF4444" size={20} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.pickBtn} onPress={handlePickDocument}>
                  <Paperclip color="#94A3B8" size={20} />
                  <Text style={styles.pickBtnText}>Chọn file từ thiết bị</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSendFeedback}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <>
                  <Send color="#0F172A" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Mở ứng dụng Email</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FBBF24' },
  scrollContent: { padding: 20 },
  infoBox: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 },
  infoTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  infoDesc: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  formCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#94A3B8', marginBottom: 8, marginLeft: 4 },
  singleInput: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    height: 56,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 15,
  },
  multiInput: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 120,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 15,
    textAlignVertical: 'top',
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#334155',
    height: 56,
    paddingHorizontal: 16,
  },
  pickBtnText: { color: '#94A3B8', fontSize: 14, marginLeft: 10 },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    height: 56,
    paddingHorizontal: 16,
  },
  attachmentName: { flex: 1, color: '#FBBF24', fontSize: 14, marginLeft: 10, marginRight: 10 },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#FBBF24',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: { opacity: 0.7 },
  submitBtnText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
});

export default SupportScreen;
