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
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "reason")
    String reason;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
    Post post;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User reporter;

    @CreationTimestamp
    LocalDateTime createdAt;

    @Builder.Default
    String status = "PENDING"; // PENDING, PROCESSED

    @Column(columnDefinition = "TEXT")
    String postContent;
}
