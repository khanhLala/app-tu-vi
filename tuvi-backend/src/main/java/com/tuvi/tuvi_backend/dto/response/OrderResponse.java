package com.tuvi.tuvi_backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    String id;
    String address;
    String phone;
    String paymentMethod;
    com.tuvi.tuvi_backend.enums.OrderStatus status;
    BigDecimal totalPrice;

    String paymentUrl;
    LocalDateTime createdAt;
    List<OrderItemResponse> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OrderItemResponse {
        String productId;
        String productName;
        String productImageUrl;
        int quantity;
        BigDecimal price;
    }
}
