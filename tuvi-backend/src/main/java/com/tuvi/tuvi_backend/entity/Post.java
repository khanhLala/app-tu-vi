package com.tuvi.tuvi_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    @Column(name = "chart_data", columnDefinition = "LONGTEXT")
    String chartData; // Lưu dữ liệu lá số dạng JSON string để hiển thị nhanh

    @ManyToOne
    @JoinColumn(name = "user_id")
    User author;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;

    @Builder.Default
    boolean isReported = false;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    List<Comment> comments;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    List<Like> likes;
}
