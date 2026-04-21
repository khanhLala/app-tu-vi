package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ApiResponse<?> getAllProducts() {
        return ApiResponse.<Object>builder()
                .code(1000)
                .result(productService.getAllProducts())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<?> getProductById(@PathVariable String id) {
        return ApiResponse.<Object>builder()
                .code(1000)
                .result(productService.getProductById(id))
                .build();
    }

    @GetMapping("/{id}/reviews")
    public ApiResponse<?> getProductReviews(@PathVariable String id) {
        return ApiResponse.<Object>builder()
                .code(1000)
                .result(productService.getProductReviews(id))
                .build();
    }
}
