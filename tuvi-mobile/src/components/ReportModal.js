import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';

const ReportModal = ({ visible, onClose, onSubmit }) => {
  const reasons = [
    'Nội dung không phù hợp hoặc quảng cáo rác',
    'Ngôn từ thiếu văn hóa hoặc quấy rối',
    'Nội dung sai lệch thông tin',
    'Vi phạm bản quyền',
    'Nội dung bạo lực hoặc gây thù ghét'
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <AlertTriangle color="#EF4444" size={20} />
                    <Text style={styles.headerTitle}>Báo cáo vi phạm</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X color="#94A3B8" size={24} />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>Vui lòng chọn lý do báo cáo bài viết này:</Text>

              <ScrollView style={styles.reasonList}>
                {reasons.map((reason, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.reasonItem}
                    onPress={() => onSubmit(reason)}
                  >
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 20,
  },
  reasonList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  reasonItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reasonText: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ReportModal;
