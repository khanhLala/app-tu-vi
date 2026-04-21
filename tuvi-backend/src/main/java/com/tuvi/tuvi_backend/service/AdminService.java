package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.entity.Order;
import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.entity.Report;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminService {

    UserRepository userRepository;
    PostRepository postRepository;
    TuViProfileRepository tuViProfileRepository;
    OrderRepository orderRepository;
    ReportRepository reportRepository;
    ProductRepository productRepository;

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalPosts", postRepository.count());
        stats.put("totalCharts", tuViProfileRepository.count());
        
        double totalRevenue = orderRepository.findAll().stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
        stats.put("totalRevenue", totalRevenue);
        
        // Real "today" counts: from midnight today
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        
        stats.put("newUsersToday", userRepository.countByCreatedAtAfter(startOfDay));
        stats.put("newPostsToday", postRepository.countByCreatedAtAfter(startOfDay));
        stats.put("newChartsToday", tuViProfileRepository.countByCreatedAtAfter(startOfDay));
        
        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    // Product Management for Admin
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    // Order Management for Admin
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public void updateOrderStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(com.tuvi.tuvi_backend.enums.OrderStatus.valueOf(status));
        orderRepository.save(order);
    }

    public List<Report> getReports(String status) {
        return reportRepository.findAllByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional
    public void resolveReport(String reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus("PROCESSED");
        reportRepository.save(report);
    }
}
