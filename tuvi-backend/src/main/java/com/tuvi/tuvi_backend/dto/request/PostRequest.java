package com.tuvi.tuvi_backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostRequest {
    String content;
    String chartData; // Hứng chuỗi JSON lá số từ Mobile
}
