package com.tuvi.tuvi_backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tuvi.tuvi_backend.dto.request.CommentRequest;
import com.tuvi.tuvi_backend.dto.request.PostRequest;
import com.tuvi.tuvi_backend.dto.response.CommentResponse;
import com.tuvi.tuvi_backend.dto.response.PostResponse;
import com.tuvi.tuvi_backend.entity.Comment;
import com.tuvi.tuvi_backend.entity.Like;
import com.tuvi.tuvi_backend.entity.Post;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.exception.AppException;
import com.tuvi.tuvi_backend.enums.ErrorCode;
import com.tuvi.tuvi_backend.repository.CommentRepository;
import com.tuvi.tuvi_backend.repository.LikeRepository;
import com.tuvi.tuvi_backend.repository.PostRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import com.tuvi.tuvi_backend.repository.ReportRepository;
import com.tuvi.tuvi_backend.entity.Report;
import com.tuvi.tuvi_backend.enums.ReportStatus;
import com.tuvi.tuvi_backend.dto.request.ReportRequest;
import com.tuvi.tuvi_backend.enums.NotificationType;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {

    PostRepository postRepository;
    UserRepository userRepository;
    LikeRepository likeRepository;
    CommentRepository commentRepository;
    ReportRepository reportRepository;
    NotificationService notificationService;
    ObjectMapper objectMapper;


    public PostResponse createPost(PostRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Post post = Post.builder()
                .content(request.getContent())
                .chartData(request.getChartData())
                .author(user)
                .build();

        Post savedPost = postRepository.save(post);

        return mapToPostResponse(savedPost, user);
    }

    public List<PostResponse> getFeed() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);

        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> mapToPostResponse(post, user))
                .collect(Collectors.toList());
    }

    public void toggleLike(String postId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài đăng không tồn tại"));

        var existingLike = likeRepository.findByPostAndUser(post, user);

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
        } else {
            Like like = Like.builder()
                    .post(post)
                    .user(user)
                    .build();
            likeRepository.save(like);
            notificationService.createNotification(post.getAuthor(), user, NotificationType.LIKE, post);
        }
    }

    public void addComment(String postId, CommentRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài đăng không tồn tại"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(post)
                .author(user)
                .build();

        commentRepository.save(comment);
        notificationService.createNotification(post.getAuthor(), user, NotificationType.COMMENT, post);
    }

    public void deletePost(String postId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài đăng không tồn tại"));

        // Kiểm tra quyền: Phải là tác giả HOẶC có quyền ADMIN
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ADMIN"));
        boolean isAuthor = post.getAuthor().getId().equals(currentUser.getId());

        if (!isAdmin && !isAuthor) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        postRepository.delete(post);
    }

    private PostResponse mapToPostResponse(Post post, User currentUser) {
        Object chartObj = null;
        try {
            if (post.getChartData() != null) {
                chartObj = objectMapper.readValue(post.getChartData(), Object.class);
            }
        } catch (JsonProcessingException e) {
            log.error("Lỗi khi deserialize chartData của bài viết: ", e);
        }

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .chartData(chartObj)
                .authorName(post.getAuthor().getFirstName() + " " + post.getAuthor().getLastName())
                .authorId(post.getAuthor().getId())
                .authorAvatar(post.getAuthor().getAvatarUrl())
                .createdAt(post.getCreatedAt())
                .likeCount(likeRepository.countByPost(post))
                .isLiked(currentUser != null && likeRepository.existsByPostAndUser(post, currentUser))
                .comments(commentRepository.findAllByPostOrderByCreatedAtAsc(post).stream()
                        .map(c -> CommentResponse.builder()
                                .id(c.getId())
                                .content(c.getContent())
                                .authorName(c.getAuthor().getFirstName() + " " + c.getAuthor().getLastName())
                                .authorId(c.getAuthor().getId())
                                .createdAt(c.getCreatedAt())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    public PostResponse getPostById(String postId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));

        return mapToPostResponse(post, currentUser);
    }

    public void reportPost(String postId, ReportRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User reporter = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));

        Report report = Report.builder()
                .post(post)
                .reporter(reporter)
                .reason(request.getReason())
                .status(ReportStatus.PENDING)
                .build();

        reportRepository.save(report);
    }

    public List<PostResponse> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> mapToPostResponse(post, null))
                .collect(Collectors.toList());
    }
}

