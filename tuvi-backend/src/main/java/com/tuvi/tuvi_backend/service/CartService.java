package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.dto.request.AddToCartRequest;
import com.tuvi.tuvi_backend.dto.response.CartItemResponse;
import com.tuvi.tuvi_backend.entity.CartItem;
import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.repository.CartItemRepository;
import com.tuvi.tuvi_backend.repository.ProductRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<CartItemResponse> getCartItemsForUser(String userId) {
        return cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToCartItemResponse)
                .collect(Collectors.toList());
    }

    public CartItemResponse addToCart(String userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if item already in cart
        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndProductId(userId, product.getId());
        
        CartItem cartItem;
        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        }
        
        return mapToCartItemResponse(cartItemRepository.save(cartItem));
    }

    public void removeFromCart(String userId, String cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
                
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        cartItemRepository.delete(cartItem);
    }

    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .productImageUrl(cartItem.getProduct().getImageUrl())
                .productPrice(cartItem.getProduct().getPrice())
                .quantity(cartItem.getQuantity())
                .build();
    }
}
