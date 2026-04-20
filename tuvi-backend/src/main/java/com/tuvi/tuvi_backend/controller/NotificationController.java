package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.entity.Notification;
import com.tuvi.tuvi_backend.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<Notification>> getMyNotifications() {
        return ApiResponse.<List<Notification>>builder()
                .result(notificationService.getMyNotifications())
                .build();
    }

    @PostMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        return ApiResponse.<Long>builder()
                .result(notificationService.getUnreadCount())
                .build();
    }
}
