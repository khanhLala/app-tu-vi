package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.entity.Order;
import com.tuvi.tuvi_backend.service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;

    @PostMapping
    public ApiResponse<Order> createOrder(@RequestParam String productId, @RequestParam int quantity) {
        return ApiResponse.<Order>builder()
                .result(orderService.createOrder(productId, quantity))
                .build();
    }

    @GetMapping("/my-orders")
    public ApiResponse<List<Order>> getMyOrders() {
        return ApiResponse.<List<Order>>builder()
                .result(orderService.getMyOrders())
                .build();
    }
}
