package com.tuvi.tuvi_backend.component;

import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.entity.ProductType;
import com.tuvi.tuvi_backend.entity.Review;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.repository.ProductRepository;
import com.tuvi.tuvi_backend.repository.ReviewRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            Product product1 = Product.builder()
                    .name("Gói Xem Hạn Năm")
                    .price(new BigDecimal("199000"))
                    .description("Luận giải chi tiết 12 tháng, dự đoán vận hạn, cơ hội và thách thức trong năm.")
                    .imageUrl("https://images.unsplash.com/photo-1549488344-c2df8b1ec0ba?auto=format&fit=crop&w=800&q=80")
                    .category("Gói xem lá số")
                    .type(ProductType.SERVICE)
                    .build();

            Product product2 = Product.builder()
                    .name("Gói Combo Trọn Đời")
                    .price(new BigDecimal("999000"))
                    .description("Không giới hạn số lượt lập lá số, phân tích chuyên sâu về tình duyên, sự nghiệp, tài lộc trọn đời.")
                    .imageUrl("https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80")
                    .category("Gói xem lá số")
                    .type(ProductType.SERVICE)
                    .build();

            Product product3 = Product.builder()
                    .name("Vòng Tay Trầm Hương Nguyên Chất")
                    .price(new BigDecimal("1500000"))
                    .description("Vòng tay trầm hương giúp xua đuổi tà khí, mang lại bình an và may mắn cho người đeo.")
                    .imageUrl("https://images.unsplash.com/photo-1611077543884-6946ce24803b?auto=format&fit=crop&w=800&q=80")
                    .category("Vật Phẩm Phong Thủy")
                    .type(ProductType.PRODUCT)
                    .build();

            productRepository.save(product1);
            productRepository.save(product2);
            productRepository.save(product3);

            // Add dummy reviews if a user exists
            Optional<User> adminOptional = userRepository.findByUsername("admin");
            if (adminOptional.isPresent()) {
                User admin = adminOptional.get();
                
                Review r1 = Review.builder()
                        .product(product1)
                        .user(admin)
                        .rating(5)
                        .comment("Rất chi tiết và chính xác. Đã giúp mình có định hướng tốt trong năm nay.")
                        .build();

                Review r2 = Review.builder()
                        .product(product1)
                        .user(admin)
                        .rating(4)
                        .comment("Dịch vụ tốt, luận giải dễ hiểu.")
                        .build();

                reviewRepository.save(r1);
                reviewRepository.save(r2);
            }
        }

        // Data Fix: Ensure all products have types based on category if they are null
        productRepository.findAll().stream()
            .filter(p -> p.getType() == null)
            .forEach(p -> {
                if ("Vật Phẩm Phong Thủy".equals(p.getCategory())) {
                    p.setType(ProductType.PRODUCT);
                } else if ("Gói xem lá số".equals(p.getCategory())) {
                    p.setType(ProductType.SERVICE);
                }
                productRepository.save(p);
            });
    }
}

