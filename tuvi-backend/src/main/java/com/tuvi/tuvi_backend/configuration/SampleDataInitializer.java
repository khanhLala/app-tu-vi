package com.tuvi.tuvi_backend.configuration;

import com.tuvi.tuvi_backend.entity.*;
import com.tuvi.tuvi_backend.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SampleDataInitializer {

    @Bean
    @Order(2) // Chạy sau DataInitializer (Order 1)
    ApplicationRunner sampleDataRunner(
            UserRepository userRepository,
            RoleRepository roleRepository,
            ProductRepository productRepository,
            PostRepository postRepository,
            ReportRepository reportRepository,
            TuViProfileRepository tuViProfileRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 5) {
                log.info("Dữ liệu mẫu đã tồn tại (count > 5). Bỏ qua seeding.");
                return;
            }

            log.info("Bắt đầu khởi tạo 50 bản ghi dữ liệu mẫu cho mỗi bảng...");
            Random random = new Random();
            Role userRole = roleRepository.findById("USER").orElse(null);
            
            // 1. Tạo 50 Users
            List<User> sampleUsers = new ArrayList<>();
            for (int i = 1; i <= 50; i++) {
                User user = User.builder()
                        .username("user_test_" + i)
                        .password(passwordEncoder.encode("password" + i))
                        .firstName("Họ_" + i)
                        .lastName("Tên_" + i)
                        .email("user" + i + "@example.com")
                        .phone("09" + String.format("%08d", i))
                        .roles(userRole != null ? Set.of(userRole) : Set.of())
                        .dob(LocalDate.now().minusYears(20 + random.nextInt(30)))
                        .build();
                sampleUsers.add(user);
            }
            userRepository.saveAll(sampleUsers);
            log.info("Đã tạo 50 người dùng mẫu.");

            // 2. Tạo 50 Products
            String[] productNames = {"Vòng tay Trầm Hương", "Tượng Tỳ Hưu Mạ Vàng", "Lắc tay Chỉ Đỏ", "Quả cầu Thạch Anh", "Kim Bài Thái Tuế", "Dây treo Xe Ôtô Phong Thủy"};
            List<Product> sampleProducts = new ArrayList<>();
            for (int i = 1; i <= 50; i++) {
                String name = productNames[random.nextInt(productNames.length)] + " " + i;
                Product product = Product.builder()
                        .name(name)
                        .description("Mô tả chi tiết cho sản phẩm " + name + ". Mang lại may mắn, bình an và tài lộc cho gia chủ.")
                        .price(100000 + random.nextInt(900000))
                        .stock(10 + random.nextInt(100))
                        .imageUrl("https://picsum.photos/400/400?random=" + i)
                        .build();
                sampleProducts.add(product);
            }
            productRepository.saveAll(sampleProducts);
            log.info("Đã tạo 50 sản phẩm phong thủy mẫu.");

            // 3. Tạo 50 Posts
            String mockChartData = "{\"personal_info\":{\"name\":\"Người dùng mẫu\",\"ngay_sinh\":\"20/05/1995\",\"gio_sinh\":\"Ngọ\",\"am_duong_nam_nu\":\"Dương Nam\",\"menh_palace\":\"Thiên Phủ\"}}";
            List<Post> samplePosts = new ArrayList<>();
            for (int i = 1; i <= 50; i++) {
                User author = sampleUsers.get(random.nextInt(sampleUsers.size()));
                Post post = Post.builder()
                        .content("Bài viết chia sẻ lá số thứ " + i + ". Mọi người xem giúp mình vận hạn năm nay với ạ!")
                        .chartData(mockChartData)
                        .author(author)
                        .isReported(i % 10 == 0) // Mỗi 10 bài có 1 bài bị báo cáo
                        .build();
                samplePosts.add(post);
            }
            postRepository.saveAll(samplePosts);
            log.info("Đã tạo 50 bài đăng cộng đồng mẫu.");

            // 4. Tạo 50 Reports
            List<Report> sampleReports = new ArrayList<>();
            for (int i = 1; i <= 20; i++) {
                Post reportedPost = samplePosts.get(random.nextInt(samplePosts.size()));
                User reporter = sampleUsers.get(random.nextInt(sampleUsers.size()));
                Report report = Report.builder()
                        .reason("Nội dung không phù hợp hoặc quảng cáo rác #" + i)
                        .post(reportedPost)
                        .reporter(reporter)
                        .status(i % 3 == 0 ? "PROCESSED" : "PENDING")
                        .build();
                sampleReports.add(report);
            }
            reportRepository.saveAll(sampleReports);
            log.info("Đã tạo 20 báo cáo mẫu (Admin test).");

            // 5. Tạo 50 TuViProfiles
            List<TuViProfile> sampleProfiles = new ArrayList<>();
            for (int i = 1; i <= 50; i++) {
                User owner = sampleUsers.get(random.nextInt(sampleUsers.size()));
                LocalDate dob = LocalDate.now().minusYears(15 + random.nextInt(40));
                TuViProfile profile = TuViProfile.builder()
                        .name("Lá số " + i)
                        .gender(random.nextBoolean() ? 1 : 0)
                        .day(dob.getDayOfMonth())
                        .month(dob.getMonthValue())
                        .year(dob.getYear())
                        .hour(random.nextInt(24))
                        .minute(0)
                        .user(owner)
                        .build();
                sampleProfiles.add(profile);
            }
            tuViProfileRepository.saveAll(sampleProfiles);
            log.info("Đã tạo 50 hồ sơ lá số mẫu.");

            log.info(">>> HOÀN TẤT KHỞI TẠO DỮ LIỆU MẪU <<<");
        };
    }
}
