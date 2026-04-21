package com.tuvi.tuvi_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiChatRequest {

    // Câu hỏi hiện tại của người dùng
    String message;

    // Lịch sử hội thoại [{role, parts}]
    @Builder.Default
    List<ChatMessage> history = List.of();

    // ai_prompt từ lá số (chuỗi mô tả 12 cung, bát tự...)
    @JsonProperty("chart_prompt")
    String chartPrompt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatMessage {
        String role;   // "user" hoặc "model"
        String parts;  // nội dung tin nhắn
    }
}
