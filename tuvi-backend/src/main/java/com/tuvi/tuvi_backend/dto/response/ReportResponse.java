package com.tuvi.tuvi_backend.dto.response;

import com.tuvi.tuvi_backend.enums.ReportStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportResponse {
    String id;
    String reason;
    String reporterName;
    String reporterUsername;
    String postId;
    String postContentPreview;
    ReportStatus status;
    LocalDateTime createdAt;
}
