package com.tuvi.tuvi_backend.entity;

import com.tuvi.tuvi_backend.enums.NotificationType;
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

    @ManyToOne
    @JoinColumn(name = "actor_id")
    User actor;

    @Enumerated(EnumType.STRING)
    NotificationType type;

    @ManyToOne
    @JoinColumn(name = "post_id")
    Post post;

    @Builder.Default
    boolean isRead = false;

    @CreationTimestamp
    LocalDateTime createdAt;
}
