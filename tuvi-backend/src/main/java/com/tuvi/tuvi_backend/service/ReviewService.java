package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.dto.request.ReviewRequest;
import com.tuvi.tuvi_backend.dto.response.ReviewResponse;
import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.entity.Review;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.repository.OrderRepository;
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

        // Rule 1: Must have a COMPLETED order with this product
        boolean hasPurchased = orderRepository.hasPurchasedProduct(user.getId(), "COMPLETED", product.getId());
        if (!hasPurchased) {
            System.out.println("Review rejection: User " + username + " (ID: " + user.getId() + ") has not purchased product " + product.getName() + " (ID: " + product.getId() + ") with COMPLETED status.");
            throw new RuntimeException("You can only review products you have purchased and received.");
        }

        // Rule 2: One review per user per product
        boolean hasReviewed = reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId());
        if (hasReviewed) {
            throw new RuntimeException("You have already reviewed this product.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
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

    public boolean checkEligibility(String productId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if ("anonymousUser".equals(username)) return false;

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return false;

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return false;

        boolean hasPurchased = orderRepository.hasPurchasedProduct(user.getId(), "COMPLETED", product.getId());
        boolean hasReviewed = reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId());

        return hasPurchased && !hasReviewed;
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
