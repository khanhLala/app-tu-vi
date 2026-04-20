package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.entity.Order;
import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.enums.OrderStatus;
import com.tuvi.tuvi_backend.repository.OrderRepository;
import com.tuvi.tuvi_backend.repository.ProductRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {

    OrderRepository orderRepository;
    ProductRepository productRepository;
    UserRepository userRepository;

    @Transactional
    public Order createOrder(String productId, int quantity) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Not enough stock");
        }

        product.setStock(product.getStock() - quantity);
        productRepository.save(product);

        Order order = Order.builder()
                .user(user)
                .product(product)
                .quantity(quantity)
                .totalAmount(product.getPrice() * quantity)
                .status(OrderStatus.PREPARING)
                .build();

        return orderRepository.save(order);
    }

    public List<Order> getMyOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findAllByUser(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public void updateStatus(String orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        orderRepository.save(order);
    }
}
