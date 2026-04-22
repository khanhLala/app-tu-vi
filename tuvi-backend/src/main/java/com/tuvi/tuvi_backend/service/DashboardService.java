package com.tuvi.tuvi_backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tuvi.tuvi_backend.dto.response.DashboardResponse;
import com.tuvi.tuvi_backend.dto.response.OrderResponse;
import com.tuvi.tuvi_backend.dto.response.ProductRevenueResponse;
import com.tuvi.tuvi_backend.entity.Order;
import com.tuvi.tuvi_backend.enums.OrderStatus;
import com.tuvi.tuvi_backend.enums.ReportStatus;
import com.tuvi.tuvi_backend.repository.OrderRepository;
import com.tuvi.tuvi_backend.repository.PostRepository;
import com.tuvi.tuvi_backend.repository.ReportRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {
        private final UserRepository userRepository;
        private final PostRepository postRepository;
        private final OrderRepository orderRepository;
        private final ReportRepository reportRepository;

        public DashboardResponse getStats() {
                LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);

                BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
                BigDecimal revenueToday = orderRepository.sumRevenueToday(startOfDay);

                return DashboardResponse.builder()
                                .totalUsers(userRepository.count())
                                .newUsersToday(userRepository.countByCreatedAtAfter(startOfDay))
                                .totalPosts(postRepository.count())
                                .newPostsToday(postRepository.countByCreatedAtAfter(startOfDay))
                                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                                .revenueToday(revenueToday != null ? revenueToday : BigDecimal.ZERO)
                                .pendingReports(reportRepository.countByStatus(ReportStatus.PENDING))
                                .build();
        }

        public List<ProductRevenueResponse> getProductRevenueStats() {
                LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
                return orderRepository.getProductRevenueStats(startOfDay).stream()
                                .map(row -> ProductRevenueResponse.builder()
                                                .productId((String) row[0])
                                                .productName((String) row[1])
                                                .imageUrl((String) row[2])
                                                .revenue((BigDecimal) row[3])
                                                .build())
                                .collect(Collectors.toList());
        }

        public List<OrderResponse> getAllOrders(OrderStatus status, String search) {
                List<Order> orders;
                if (status != null) {
                        orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
                } else {
                        orders = orderRepository.findAllByOrderByCreatedAtDesc();
                }

                if (search != null && !search.isEmpty()) {
                        String finalSearch = search.toLowerCase();
                        return orders.stream()
                                        .filter(o -> o.getId().toLowerCase().contains(finalSearch))
                                        .map(this::mapToOrderResponse)
                                        .collect(Collectors.toList());
                }

                return orders.stream()
                                .map(this::mapToOrderResponse)
                                .collect(Collectors.toList());
        }

        public List<OrderResponse> getOrdersByProduct(String productId) {
                return orderRepository.findOrdersByProductId(productId).stream()
                                .map(this::mapToOrderResponse)
                                .collect(Collectors.toList());
        }

        public OrderResponse updateOrderStatus(String orderId, OrderStatus status) {

                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));
                order.setStatus(status);
                orderRepository.save(order);
                return mapToOrderResponse(order);
        }

        private OrderResponse mapToOrderResponse(Order order) {

                List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                                .map(item -> OrderResponse.OrderItemResponse.builder()
                                                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                                                .productName(item.getProduct() != null ? item.getProduct().getName()
                                                                : "Unknown Product")
                                                .productImageUrl(item.getProduct() != null
                                                                ? item.getProduct().getImageUrl()
                                                                : null)
                                                .quantity(item.getQuantity())
                                                .price(item.getPrice())
                                                .build())
                                .collect(Collectors.toList());

                return OrderResponse.builder()
                                .id(order.getId())
                                .address(order.getAddress())
                                .phone(order.getPhone())
                                .paymentMethod(order.getPaymentMethod())
                                .status(order.getStatus())
                                .totalPrice(order.getTotalPrice())
                                .createdAt(order.getCreatedAt())
                                .items(itemResponses)
                                .build();
        }
}
