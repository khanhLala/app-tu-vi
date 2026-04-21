import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Sparkles, Bot, User, RotateCcw } from 'lucide-react-native';
import axiosClient from '../api/axiosClient';

// ── Câu hỏi gợi ý nhanh ────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Phân tích cung Mệnh của tôi',
  'Tài lộc năm nay thế nào?',
  'Hôn nhân và tình duyên',
  'Sự nghiệp công việc',
  'Sức khỏe cần lưu ý gì?',
  'Đại hạn hiện tại ra sao?',
];

// ── Component bubble tin nhắn ───────────────────────────────────────────────
const MessageBubble = ({ item }) => {
  const isUser = item.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAI]}>
      {!isUser && (
        <View style={styles.avatarAI}>
          <Bot color="#FBBF24" size={16} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {item.parts}
        </Text>
      </View>
      {isUser && (
        <View style={styles.avatarUser}>
          <User color="#0F172A" size={16} />
        </View>
      )}
    </View>
  );
};

// ── Component typing indicator ─────────────────────────────────────────────
const TypingIndicator = () => (
  <View style={[styles.bubbleRow, styles.bubbleRowAI]}>
    <View style={styles.avatarAI}>
      <Bot color="#FBBF24" size={16} />
    </View>
    <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
      <Text style={styles.typingDots}>● ● ●</Text>
    </View>
  </View>
);

// ── Main Screen ─────────────────────────────────────────────────────────────
const ChatScreen = ({ navigation, route }) => {
  const chartData = route.params?.chartData || null;
  const insets = useSafeAreaInsets();


  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      parts: chartData
        ? `Xin chào! Tôi là trợ lý Tử Vi AI. Tôi đã nhận được lá số của **${chartData?.personal_info?.name || 'bạn'}**. Hãy hỏi tôi bất cứ điều gì về lá số nhé!`
        : 'Xin chào! Tôi là trợ lý Tử Vi AI. Hãy đặt câu hỏi về kiến thức Tử Vi hoặc cung cấp lá số để tôi phân tích chi tiết hơn!',
    },
  ]);
  const [inputText, setInputText]     = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  const flatListRef = useRef(null);

  // Lấy ai_prompt từ chartData nếu có
  const chartPrompt = chartData?.ai_prompt || '';

  // Chuyển messages thành history format cho API (bỏ tin nhắn welcome)
  const buildHistory = useCallback((msgs) => {
    return msgs
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, parts: m.parts }));
  }, []);

  const sendMessage = async (text) => {
    const trimmed = (text || inputText).trim();
    if (!trimmed || isLoading) return;

    setInputText('');
    setShowQuickPrompts(false);

    // Thêm tin nhắn user vào danh sách
    const userMsg = { id: Date.now().toString(), role: 'user', parts: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Scroll xuống cuối
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = buildHistory(updatedMessages);
      const historyWithoutLast = history.slice(0, -1);

      const response = await axiosClient.post('/ai/chat', {
        message: trimmed,
        history: historyWithoutLast,
        chart_prompt: chartPrompt,
      });

      const answer = response?.answer || response?.result?.answer || 'Xin lỗi, tôi không thể trả lời lúc này.';
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'model', parts: answer };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
      
      // Lấy thông báo lỗi từ backend (ví dụ: "Hệ thống AI đang quá tải...")
      const errorText = error?.detail || error?.message || 'Lỗi kết nối. Vui lòng thử lại sau.';
      
      const aiErrorMsg = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        parts: `⚠️ ${errorText}` 
      };
      
      setMessages(prev => [...prev, aiErrorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const clearChat = () => {
    Alert.alert('Xóa hội thoại', 'Bạn có muốn bắt đầu cuộc trò chuyện mới không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setMessages([{
            id: 'welcome',
            role: 'model',
            parts: chartData
              ? `Cuộc trò chuyện mới bắt đầu! Lá số của **${chartData?.personal_info?.name || 'bạn'}** vẫn được giữ nguyên.`
              : 'Cuộc trò chuyện mới bắt đầu! Hãy đặt câu hỏi về Tử Vi.',
          }]);
          setShowQuickPrompts(true);
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#FBBF24" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Sparkles color="#FBBF24" size={18} />
            <Text style={styles.headerTitle}>Thầy Tử Vi AI</Text>
          </View>
          <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
            <RotateCcw color="#64748B" size={20} />
          </TouchableOpacity>
        </View>

        {/* ── Context banner lá số ── */}
        {chartData && (
          <View style={styles.contextBanner}>
            <Sparkles color="#FBBF24" size={14} />
            <Text style={styles.contextText} numberOfLines={1}>
              Đang phân tích lá số: {chartData?.personal_info?.name}
            </Text>
          </View>
        )}

        {/* ── Danh sách tin nhắn ── */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MessageBubble item={item} />}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListFooterComponent={isLoading ? <TypingIndicator /> : null}
          />

          {/* ── Gợi ý câu hỏi nhanh ── */}
          {showQuickPrompts && (
            <View style={styles.quickPromptsContainer}>
              <Text style={styles.quickPromptsLabel}>Gợi ý câu hỏi:</Text>
              <View style={styles.quickPromptsRow}>
                {QUICK_PROMPTS.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickPromptChip}
                    onPress={() => sendMessage(prompt)}
                  >
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Input box ── */}
          <View style={[styles.inputBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Hỏi về lá số của bạn..."
              placeholderTextColor="#475569"
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0F172A" size="small" />
              ) : (
                <Send color="#0F172A" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

      </SafeAreaView>
    </LinearGradient>
  );
};

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1 },
  safeArea:     { flex: 1 },
  flex:         { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  backBtn:  { padding: 4 },
  clearBtn: { padding: 4 },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { color: '#FBBF24', fontSize: 17, fontWeight: 'bold' },

  // Context banner
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251,191,36,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(251,191,36,0.2)',
    gap: 8,
  },
  contextText: { color: '#FBBF24', fontSize: 12, flex: 1 },

  // Message list
  messageList: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 4 },
  bubbleRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAI:   { justifyContent: 'flex-start' },

  avatarAI: {
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(251,191,36,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  avatarUser: {
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#FBBF24',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 0.5,
    borderColor: '#334155',
    borderBottomLeftRadius: 4,
  },
  bubbleText:     { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#0F172A', fontWeight: '500' },
  bubbleTextAI:   { color: '#E2E8F0' },

  // Typing indicator
  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },
  typingDots:   { color: '#64748B', fontSize: 12, letterSpacing: 4 },

  // Quick prompts
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#1E293B',
  },
  quickPromptsLabel: { color: '#64748B', fontSize: 11, marginBottom: 8, fontWeight: '600' },
  quickPromptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickPromptChip: {
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickPromptText: { color: '#94A3B8', fontSize: 12 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#334155',
    gap: 10,
    backgroundColor: '#0F172A',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: '#1E293B',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: { backgroundColor: '#334155', shadowOpacity: 0 },
});

export default ChatScreen;
