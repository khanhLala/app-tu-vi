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
@Table(name = "tuvi_profiles")
public class TuViProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String name;
    int day;
    int month;
    int year;
    int hour;
    int minute;
    int gender; // 1: Nam, 0: Nữ
    boolean isLunar;

    @Column(name = "chart_data", columnDefinition = "LONGTEXT")
    String chartData;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @CreationTimestamp
    LocalDateTime createdAt;
}
