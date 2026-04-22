package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.dto.request.OrderRequest;
import com.tuvi.tuvi_backend.dto.response.OrderResponse;
import com.tuvi.tuvi_backend.entity.*;
import com.tuvi.tuvi_backend.enums.OrderStatus;
import com.tuvi.tuvi_backend.repository.*;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderService {
    final OrderRepository orderRepository;
    final OrderItemRepository orderItemRepository;
    final CartItemRepository cartItemRepository;
    final UserRepository userRepository;
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

        // For testing, we allow completing from PENDING, PAID or SHIPPING
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("Order is already " + order.getStatus());
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
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProduct() != null ? item.getProduct().getName() : "Unknown Product")
                        .productImageUrl(item.getProduct() != null ? item.getProduct().getImageUrl() : null)
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
                .paymentUrl(paymentUrl)
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
