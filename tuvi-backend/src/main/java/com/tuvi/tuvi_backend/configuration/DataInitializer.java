package com.tuvi.tuvi_backend.configuration;

import com.tuvi.tuvi_backend.entity.Role;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.repository.RoleRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DataInitializer {

    @Bean
    ApplicationRunner applicationRunner(
            RoleRepository roleRepository, 
            UserRepository userRepository, 
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Khởi tạo các Role nếu chưa có
            if (roleRepository.count() == 0) {
                Role userRole = Role.builder()
                        .name("USER")
                        .description("Quyền người dùng cơ bản")
                        .build();

                Role adminRole = Role.builder()
                        .name("ADMIN")
                        .description("Quyền quản trị viên")
                        .build();

                roleRepository.saveAll(List.of(userRole, adminRole));
                log.info("Đã khởi tạo các quyền mặc định: USER, ADMIN");
            }

            // Lấy lại các role từ DB
            Role adminRole = roleRepository.findById("ADMIN").orElse(null);
            Role userRole = roleRepository.findById("USER").orElse(null);

            // 2. Khởi tạo tài khoản ADMIN mẫu
            if (adminRole != null && !userRepository.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .roles(Set.of(adminRole))
                        .firstName("Admin")
                        .lastName("System")
                        .build();
                userRepository.save(admin);
                log.info("Đã khởi tạo tài khoản ADMIN mẫu: admin/admin");
            }

            // 3. Khởi tạo tài khoản USER mẫu
            if (userRole != null && !userRepository.existsByUsername("user1")) {
                User user1 = User.builder()
                        .username("user1")
                        .password(passwordEncoder.encode("12345678"))
                        .roles(Set.of(userRole))
                        .firstName("User")
                        .lastName("One")
                        .build();
                userRepository.save(user1);
                log.info("Đã khởi tạo tài khoản USER mẫu: user1/12345678");
            }
        };
    }
}
