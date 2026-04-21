import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';

const ConfirmModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy bỏ',
  isDanger = false,
  loading = false
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={loading ? null : onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <AlertCircle color={isDanger ? "#EF4444" : "#FBBF24"} size={20} />
                    <Text style={styles.headerTitle}>{title}</Text>
                </View>
                {!loading && (
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X color="#94A3B8" size={24} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.subtitle}>{message}</Text>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.btn, styles.cancelBtn]} 
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelBtnText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.btn, isDanger ? styles.dangerBtn : styles.confirmBtn]} 
                  onPress={onConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#0F172A" />
                  ) : (
                    <Text style={[styles.confirmBtnText, isDanger && styles.dangerBtnText]}>
                      {confirmText}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
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
    maxWidth: 350,
    padding: 24,
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
    marginBottom: 12,
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
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#334155',
  },
  confirmBtn: {
    backgroundColor: '#FBBF24',
  },
  dangerBtn: {
    backgroundColor: '#EF4444',
  },
  cancelBtnText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  dangerBtnText: {
    color: '#FFFFFF',
  }
});

export default ConfirmModal;
