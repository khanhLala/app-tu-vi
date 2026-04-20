package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.entity.Notification;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.repository.NotificationRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {

    NotificationRepository notificationRepository;
    UserRepository userRepository;

    public void createNotification(User recipient, String senderName, String message, String type, String postId) {
        // Don't notify if sender is the recipient
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (recipient.getUsername().equals(currentUsername)) {
            return;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .senderName(senderName)
                .message(message)
                .type(type)
                .postId(postId)
                .build();
        notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findAllByRecipientOrderByCreatedAtDesc(user);
    }

    @Transactional
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public long getUnreadCount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }
}
