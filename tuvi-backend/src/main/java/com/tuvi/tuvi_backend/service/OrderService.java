package com.tuvi.tuvi_backend.service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tuvi.tuvi_backend.dto.request.OrderRequest;
import com.tuvi.tuvi_backend.dto.response.OrderResponse;
import com.tuvi.tuvi_backend.entity.CartItem;
import com.tuvi.tuvi_backend.entity.Order;
import com.tuvi.tuvi_backend.entity.OrderItem;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.enums.OrderStatus;
import com.tuvi.tuvi_backend.repository.CartItemRepository;
import com.tuvi.tuvi_backend.repository.OrderItemRepository;
import com.tuvi.tuvi_backend.repository.OrderRepository;
import com.tuvi.tuvi_backend.repository.ReviewRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderService {
    final OrderRepository orderRepository;
    final OrderItemRepository orderItemRepository;
    final CartItemRepository cartItemRepository;
    final UserRepository userRepository;
    final ReviewRepository reviewRepository;
    final HttpServletRequest httpServletRequest;

    @Value("${vqr.bankId}")
    String vqr_BankId;
    @Value("${vqr.accountNo}")
    String vqr_AccountNo;
    @Value("${vqr.accountName}")
    String vqr_AccountName;
    @Value("${vqr.template}")
    String vqr_Template;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Calculate total price
        BigDecimal totalPrice = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create Order
        Order order = Order.builder()
                .user(user)
                .address(request.getAddress())
                .phone(request.getPhone())
                .paymentMethod(request.getPaymentMethod())
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .build();


        Order savedOrder = orderRepository.save(order);

        // Convert CartItems to OrderItems
        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            return OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getProduct().getPrice())
                    .build();
        }).collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);

        // Clear Cart
        cartItemRepository.deleteAll(cartItems);

        // Update User profile address and phone as requested
        user.setAddress(request.getAddress());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        String paymentUrl = null;
        if ("BANK_TRANSFER".equals(request.getPaymentMethod())) {
            paymentUrl = generateVietQRUrl(savedOrder);
        }

        return mapToOrderResponse(savedOrder, orderItems, paymentUrl);
    }

    private String generateVietQRUrl(Order order) {
        String description = "TUVI " + order.getId().substring(0, 8).toUpperCase();
        String amount = String.valueOf(order.getTotalPrice().longValue());
        
        // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<NAME>
        return String.format("https://img.vietqr.io/image/%s-%s-%s.png?amount=%s&addInfo=%s&accountName=%s",
                vqr_BankId,
                vqr_AccountNo,
                vqr_Template,
                amount,
                URLEncoder.encode(description, StandardCharsets.UTF_8),
                URLEncoder.encode(vqr_AccountName, StandardCharsets.UTF_8)
        );
    }



    @Transactional
    public OrderResponse cancelOrder(String orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {

            throw new RuntimeException("Order cannot be cancelled in current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);

        orderRepository.save(order);
        return mapToOrderResponse(order, order.getItems(), null);
    }

    @Transactional
    public OrderResponse completeOrder(String orderId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to complete this order");
        }

        // User can only mark as COMPLETED (Received) if status is DELIVERED (Delivered by Admin)
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Bạn chỉ có thể xác nhận đã nhận hàng sau khi đơn hàng đã được giao thành công.");
        }

        order.setStatus(OrderStatus.COMPLETED);

        orderRepository.save(order);
        return mapToOrderResponse(order, order.getItems(), null);
    }

    public List<OrderResponse> getMyOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(order -> mapToOrderResponse(order, order.getItems(), null))
                .collect(Collectors.toList());
    }

    private OrderResponse mapToOrderResponse(Order order, List<OrderItem> items, String paymentUrl) {
        List<OrderResponse.OrderItemResponse> itemResponses = (items == null) ? Collections.emptyList() : items.stream()
                .map(item -> {
                    boolean isReviewed = false;
                    if (order.getUser() != null && item.getProduct() != null) {
                        isReviewed = reviewRepository.existsByUserIdAndProductIdAndOrderId(
                                order.getUser().getId(), 
                                item.getProduct().getId(), 
                                order.getId()
                        );
                    }
                    return OrderResponse.OrderItemResponse.builder()
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProduct() != null ? item.getProduct().getName() : "Unknown Product")
                        .productImageUrl(item.getProduct() != null ? item.getProduct().getImageUrl() : null)
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .isReviewed(isReviewed)
                        .build();
                })
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .address(order.getAddress())
                .phone(order.getPhone())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .paymentUrl(paymentUrl)
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
