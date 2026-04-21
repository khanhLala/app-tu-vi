package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.dto.request.AiChatRequest;
import com.tuvi.tuvi_backend.dto.response.AiChatResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiChatController {

    final RestTemplate restTemplate;

    // URL của tuvi-ai service — cấu hình trong .env, mặc định localhost:8001
    @Value("${ai.service.url:http://localhost:8001}")
    String aiServiceUrl;

    /**
     * Proxy endpoint: nhận câu hỏi từ Mobile (đã xác thực JWT),
     * forward sang tuvi-ai service và trả kết quả về.
     *
     * Mobile  →  POST /api/v1/ai/chat  (Spring Boot, port 8080)
     *                    ↓ forward
     *            POST /api/v1/chat     (tuvi-ai, port 8001)
     */
    @PostMapping("/chat")
    public ApiResponse<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        String targetUrl = aiServiceUrl + "/api/v1/chat";
        log.info("Forward AI chat request đến: {}", targetUrl);

        try {
            // Gọi tuvi-ai service
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AiChatRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<AiChatResponse> response = restTemplate.exchange(
                    targetUrl,
                    HttpMethod.POST,
                    entity,
                    AiChatResponse.class
            );

            AiChatResponse body = response.getBody();
            log.info("AI trả lời thành công, sources_used={}", body != null ? body.getSourcesUsed() : 0);

            return ApiResponse.<AiChatResponse>builder()
                    .result(body)
                    .build();

        } catch (HttpClientErrorException e) {
            // Lỗi 4xx từ tuvi-ai (VD: 503 thiếu API key)
            log.error("Lỗi từ AI service: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("AI service lỗi: " + e.getResponseBodyAsString());

        } catch (ResourceAccessException e) {
            // tuvi-ai service không chạy
            log.error("Không thể kết nối tới AI service: {}", e.getMessage());
            throw new RuntimeException("AI service hiện không khả dụng. Vui lòng thử lại sau.");
        }
    }
}
