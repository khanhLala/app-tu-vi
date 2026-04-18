import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Share, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { Heart, MessageCircle, Share2, AlertCircle, Trash2, Send, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const PostCard = ({ post, onLike, onReport, onDelete, onComment, currentUserId, isAdmin }) => {
  const navigation = useNavigation();
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');
  const [commenting, setCommenting] = React.useState(false);

  const chartData = post.chartData; // Backend đã parse sẵn JSON
  const isAuthor = currentUserId === post.authorId;
  const canDelete = isAuthor || isAdmin;

  const getRelativeTime = (dateString) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 3) return 'Vừa xong';
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} tiếng trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return `${postDate.toLocaleDateString()} ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Lá số của ${chartData?.personal_info?.name || 'tôi'}: ${post.content}\nXem lá số tại Tử Vi App!`,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      await onComment(post.id, commentText);
      setCommentText('');
    } finally {
      setCommenting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.authorAvatar ? (
            <Image source={{ uri: post.authorAvatar }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{post.authorName.charAt(0)}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.timeText}>{getRelativeTime(post.createdAt)}</Text>
        </View>
        
        <View style={styles.headerActions}>
            {canDelete && (
                <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                    <Trash2 color="#EF4444" size={18} />
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.reportBtn} onPress={onReport}>
                <AlertCircle color="#64748B" size={18} />
                <Text style={styles.reportText}>Báo cáo</Text>
            </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {chartData && (
    <TouchableOpacity 
          style={styles.chartMiniBox} 
          onPress={() => navigation.navigate('ChartDetail', { chartData, hidePrivateInfo: true })}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.chartTitle}>Lá số đính kèm: {chartData.personal_info.name}</Text>
            <Text style={styles.chartInfo}>{chartData.personal_info.am_duong_nam_nu}</Text>
            <Text style={styles.chartInfo}>Mệnh: {chartData.personal_info.menh_palace}</Text>
          </View>
          <ChevronRight color="#FBBF24" size={20} />
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={onLike}>
          <Heart 
            color={!!post.isLiked ? '#EF4444' : '#94A3B8'} 
            fill={!!post.isLiked ? '#EF4444' : 'transparent'} 
            size={20} 
          />
          <Text style={[styles.actionText, !!post.isLiked && { color: '#EF4444' }]}>{post.likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(!showComments)}>
          <MessageCircle color={showComments ? '#FBBF24' : '#94A3B8'} size={20} />
          <Text style={[styles.actionText, showComments && { color: '#FBBF24' }]}>{post.comments?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Share2 color="#94A3B8" size={20} />
          <Text style={styles.actionText}>Gửi</Text>
        </TouchableOpacity>
      </View>

      {showComments && (
        <View style={styles.commentSection}>
          {post.comments && post.comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>{comment.authorName}: </Text>
                <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
          
          <View style={styles.commentInputRow}>
            <TextInput
                style={styles.commentInput}
                placeholder="Viết bình luận..."
                placeholderTextColor="#64748B"
                value={commentText}
                onChangeText={setCommentText}
            />
            <TouchableOpacity onPress={submitComment} disabled={commenting || !commentText.trim()}>
                {commenting ? (
                    <ActivityIndicator size="small" color="#FBBF24" />
                ) : (
                    <Send color={commentText.trim() ? "#FBBF24" : "#475569"} size={20} />
                )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarText: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold' },
  avatarImg: { width: '100%', height: '100%' },
  authorName: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  timeText: { color: '#64748B', fontSize: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  reportBtn: { flexDirection: 'row', alignItems: 'center', marginLeft: 15 },
  reportText: { color: '#64748B', fontSize: 12, marginLeft: 4 },
  deleteBtn: { padding: 4 },
  content: { color: '#F1F5F9', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  chartMiniBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FBBF24',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#334155',
  },
  chartTitle: { color: '#FBBF24', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  chartInfo: { color: '#94A3B8', fontSize: 12 },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#334155',
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', minWidth: 60 },
  actionText: { color: '#94A3B8', fontSize: 14, marginLeft: 6 },
  commentSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 0.5,
    borderTopColor: '#334155',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentAuthor: { color: '#FBBF24', fontSize: 13, fontWeight: 'bold' },
  commentContent: { color: '#CBD5E1', fontSize: 13, flex: 1 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  commentInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    marginRight: 10,
  },
});

export default PostCard;
