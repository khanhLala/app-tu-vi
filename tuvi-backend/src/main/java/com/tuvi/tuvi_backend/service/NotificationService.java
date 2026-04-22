package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.dto.response.NotificationResponse;
import com.tuvi.tuvi_backend.entity.Notification;
import com.tuvi.tuvi_backend.entity.Post;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.enums.NotificationType;
import com.tuvi.tuvi_backend.repository.NotificationRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {
    NotificationRepository notificationRepository;
    UserRepository userRepository;

    public void createNotification(User recipient, User actor, NotificationType type, Post post) {
        if (recipient.getId().equals(actor.getId())) {
            return; // Don't notify self
        }

        if (recipient.getNotificationsEnabled() != null && !recipient.getNotificationsEnabled()) {
            return; // Notifications disabled for this user
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .post(post)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMyNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findAllByRecipientOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findAllByRecipientOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepository.deleteAllByRecipient(user);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        String actorName = "Người dùng";
        String actorAvatar = null;
        if (notification.getActor() != null) {
            actorName = (notification.getActor().getFirstName() != null ? notification.getActor().getFirstName() : "") + " " + 
                        (notification.getActor().getLastName() != null ? notification.getActor().getLastName() : "");
            actorName = actorName.trim().isEmpty() ? notification.getActor().getUsername() : actorName.trim();
            actorAvatar = notification.getActor().getAvatarUrl();
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .actorName(actorName)
                .actorAvatar(actorAvatar)
                .type(notification.getType())
                .postId(notification.getPost() != null ? notification.getPost().getId() : null)
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
