package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {

    ProductService productService;

    @GetMapping
    public ApiResponse<List<Product>> getAllProducts() {
        return ApiResponse.<List<Product>>builder()
                .result(productService.getAllProducts())
                .build();
    }

    @PostMapping("/admin")
    public ApiResponse<Product> createProduct(@RequestBody Product product) {
        return ApiResponse.<Product>builder()
                .result(productService.createProduct(product))
                .build();
    }

    @DeleteMapping("/admin/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ApiResponse.<Void>builder().build();
    }
}
