package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.dto.request.ReviewRequest;
import com.tuvi.tuvi_backend.dto.response.ReviewResponse;
import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.entity.Review;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.repository.OrderRepository;
import com.tuvi.tuvi_backend.enums.OrderStatus;
import com.tuvi.tuvi_backend.repository.ProductRepository;

import com.tuvi.tuvi_backend.repository.ReviewRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {
    ReviewRepository reviewRepository;
    ProductRepository productRepository;
    UserRepository userRepository;
    OrderRepository orderRepository;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        com.tuvi.tuvi_backend.entity.Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Rule 1: Must belong to this user and be COMPLETED
        if (!order.getUser().getId().equals(user.getId()) || order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException("You can only review products from your completed orders.");
        }

        // Rule 2: One review per product per order
        boolean hasReviewed = reviewRepository.existsByUserIdAndProductIdAndOrderId(user.getId(), product.getId(), order.getId());
        if (hasReviewed) {
            throw new RuntimeException("You have already reviewed this product for this order.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .order(order)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToReviewResponse(savedReview);
    }

    public List<ReviewResponse> getReviewsByProduct(String productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    public boolean checkEligibility(String productId, String orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if ("anonymousUser".equals(username)) return false;

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return false;

        com.tuvi.tuvi_backend.entity.Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || !order.getUser().getId().equals(user.getId()) || order.getStatus() != OrderStatus.COMPLETED) {
            return false;
        }

        boolean hasReviewed = reviewRepository.existsByUserIdAndProductIdAndOrderId(user.getId(), productId, orderId);

        return !hasReviewed;
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        User user = review.getUser();
        String displayName = (user.getFirstName() != null || user.getLastName() != null)
                ? (user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : "")
                : user.getUsername();

        return ReviewResponse.builder()
                .id(review.getId())
                .username(displayName.trim())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
