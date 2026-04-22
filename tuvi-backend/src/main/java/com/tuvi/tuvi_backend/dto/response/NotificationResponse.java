package com.tuvi.tuvi_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tuvi.tuvi_backend.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String actorName;
    String actorAvatar;
    NotificationType type;
    String postId;
    @JsonProperty("isRead")
    boolean isRead;
    LocalDateTime createdAt;
}
