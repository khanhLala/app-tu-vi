package com.tuvi.tuvi_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "post_id", "user_id" })
})
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "post_id")
    Post post;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;
}
