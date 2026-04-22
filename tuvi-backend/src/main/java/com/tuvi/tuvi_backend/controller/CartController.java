package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.dto.request.AddToCartRequest;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.repository.UserRepository;
import com.tuvi.tuvi_backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    private final UserRepository userRepository;

    private String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping
    public ApiResponse<?> getCart() {
        return ApiResponse.<Object>builder()
                .code(1000)
                .result(cartService.getCartItemsForUser(getCurrentUserId()))
                .build();
    }

    @PostMapping("/add")
    public ApiResponse<?> addToCart(@RequestBody AddToCartRequest request) {
        return ApiResponse.<Object>builder()
                .code(1000)
                .result(cartService.addToCart(getCurrentUserId(), request))
                .build();
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ApiResponse<?> removeFromCart(@PathVariable String cartItemId) {
        cartService.removeFromCart(getCurrentUserId(), cartItemId);
        return ApiResponse.<Object>builder()
                .code(1000)
                .message("Đã xóa khỏi giỏ hàng")
                .build();
    }

    @PutMapping("/update/{cartItemId}/{quantity}")
    public ApiResponse<?> updateQuantity(@PathVariable String cartItemId, @PathVariable Integer quantity) {
        return ApiResponse.<Object>builder()
                .code(1000)
                .result(cartService.updateQuantity(getCurrentUserId(), cartItemId, quantity))
                .build();
    }
}
