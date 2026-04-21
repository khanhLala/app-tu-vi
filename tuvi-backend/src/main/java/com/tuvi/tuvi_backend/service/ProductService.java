package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.dto.response.ProductResponse;
import com.tuvi.tuvi_backend.dto.response.ReviewResponse;
import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.entity.Review;
import com.tuvi.tuvi_backend.repository.ProductRepository;
import com.tuvi.tuvi_backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToProductResponse(product);
    }

    public List<ReviewResponse> getProductReviews(String id) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(id).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .category(product.getCategory())
                .build();
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .username(review.getUser().getUsername())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
