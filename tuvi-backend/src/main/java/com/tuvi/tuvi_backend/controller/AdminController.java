package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.entity.Report;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.service.AdminService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    AdminService adminService;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        return ApiResponse.<Map<String, Object>>builder()
                .result(adminService.getStats())
                .build();
    }

    @GetMapping("/users")
    public ApiResponse<List<User>> getAllUsers() {
        return ApiResponse.<List<User>>builder()
                .result(adminService.getAllUsers())
                .build();
    }

    @DeleteMapping("/users/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/reports")
    public ApiResponse<List<Report>> getReports(@RequestParam(defaultValue = "PENDING") String status) {
        return ApiResponse.<List<Report>>builder()
                .result(adminService.getReports(status))
                .build();
    }

    @PostMapping("/reports/{reportId}/resolve")
    public ApiResponse<Void> resolveReport(@PathVariable String reportId) {
        adminService.resolveReport(reportId);
        return ApiResponse.<Void>builder().build();
    }

    // Product CRUD
    @GetMapping("/products")
    public ApiResponse<List<com.tuvi.tuvi_backend.entity.Product>> getAllProducts() {
        return ApiResponse.<List<com.tuvi.tuvi_backend.entity.Product>>builder()
                .result(adminService.getAllProducts())
                .build();
    }

    @PostMapping("/products")
    public ApiResponse<com.tuvi.tuvi_backend.entity.Product> saveProduct(@RequestBody com.tuvi.tuvi_backend.entity.Product product) {
        return ApiResponse.<com.tuvi.tuvi_backend.entity.Product>builder()
                .result(adminService.saveProduct(product))
                .build();
    }

    @DeleteMapping("/products/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable String id) {
        adminService.deleteProduct(id);
        return ApiResponse.<Void>builder().build();
    }

    // Order Management
    @GetMapping("/orders")
    public ApiResponse<List<com.tuvi.tuvi_backend.entity.Order>> getAllOrders() {
        return ApiResponse.<List<com.tuvi.tuvi_backend.entity.Order>>builder()
                .result(adminService.getAllOrders())
                .build();
    }

    @PostMapping("/orders/{orderId}/status")
    public ApiResponse<Void> updateOrderStatus(@PathVariable String orderId, @RequestParam String status) {
        adminService.updateOrderStatus(orderId, status);
        return ApiResponse.<Void>builder().build();
    }
}
