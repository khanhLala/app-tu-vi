package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.dto.response.DashboardResponse;
import com.tuvi.tuvi_backend.dto.response.OrderResponse;
import com.tuvi.tuvi_backend.dto.response.ProductRevenueResponse;
import com.tuvi.tuvi_backend.enums.OrderStatus;
import com.tuvi.tuvi_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;



import java.util.List;


@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<DashboardResponse> getStats() {
        return ApiResponse.<DashboardResponse>builder()
                .code(1000)
                .result(dashboardService.getStats())
                .build();
    }

    @GetMapping("/product-revenue")
    public ApiResponse<List<ProductRevenueResponse>> getProductRevenue() {
        return ApiResponse.<List<ProductRevenueResponse>>builder()
                .code(1000)
                .result(dashboardService.getProductRevenueStats())
                .build();
    }

    @GetMapping("/product-orders/{productId}")
    public ApiResponse<List<OrderResponse>> getProductOrders(@PathVariable String productId) {
        return ApiResponse.<List<OrderResponse>>builder()
                .code(1000)
                .result(dashboardService.getOrdersByProduct(productId))
                .build();
    }

    @GetMapping("/orders")
    public ApiResponse<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search) {
        return ApiResponse.<List<OrderResponse>>builder()
                .code(1000)
                .result(dashboardService.getAllOrders(status, search))
                .build();
    }


    @PutMapping("/orders/{orderId}/status")
    public ApiResponse<OrderResponse> updateOrderStatus(@PathVariable String orderId, @RequestParam OrderStatus status) {
        return ApiResponse.<OrderResponse>builder()
                .code(1000)
                .result(dashboardService.updateOrderStatus(orderId, status))
                .build();
    }
}



