package com.tuvi.tuvi_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    String id;
    String content;
    Object chartData; // Đã đổi sang Object để khớp với Mobile
    String authorName;
    String authorId;
    String authorAvatar;
    LocalDateTime createdAt;
    long likeCount;

    @JsonProperty("isLiked")
    boolean isLiked;
    List<CommentResponse> comments;
}
