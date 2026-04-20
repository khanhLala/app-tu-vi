package com.tuvi.tuvi_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    User recipient;

    String senderName;
    String message;
    String type; // LIKE, COMMENT
    String postId;
    
    @Builder.Default
    boolean isRead = false;

    @CreationTimestamp
    LocalDateTime createdAt;
}
