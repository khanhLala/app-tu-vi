package com.tuvi.tuvi_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiChatResponse {

    // Câu trả lời từ Gemini
    String answer;

    // Số chunk tài liệu đã dùng để trả lời
    @JsonProperty("sources_used")
    int sourcesUsed;
}
