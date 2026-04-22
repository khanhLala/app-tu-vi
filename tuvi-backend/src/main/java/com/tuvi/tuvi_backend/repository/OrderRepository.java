package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.Order;
import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i WHERE o.user.id = :userId AND o.status = :status AND i.product.id = :productId")
    boolean hasPurchasedProduct(@Param("userId") String userId, 
                                @Param("status") OrderStatus status, 
                                @Param("productId") String productId);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<Order> findAllByOrderByCreatedAtDesc();



    @Query("SELECT SUM(i.price * i.quantity) FROM OrderItem i WHERE i.order.status <> com.tuvi.tuvi_backend.enums.OrderStatus.CANCELLED AND i.product.type = 'PRODUCT'")
    java.math.BigDecimal sumTotalRevenue();

    @Query("SELECT SUM(i.price * i.quantity) FROM OrderItem i WHERE i.order.status <> com.tuvi.tuvi_backend.enums.OrderStatus.CANCELLED AND i.product.type = 'PRODUCT' AND i.order.createdAt > :date")
    java.math.BigDecimal sumRevenueToday(@Param("date") java.time.LocalDateTime date);


    @Query("SELECT i.product.id, i.product.name, i.product.imageUrl, SUM(i.price * i.quantity) as revenue " +
           "FROM OrderItem i " +
           "WHERE i.order.status <> com.tuvi.tuvi_backend.enums.OrderStatus.CANCELLED AND i.product.type = 'PRODUCT' AND i.order.createdAt > :date " +
           "GROUP BY i.product.id, i.product.name, i.product.imageUrl " +
           "ORDER BY revenue DESC")
    List<Object[]> getProductRevenueStats(@Param("date") java.time.LocalDateTime date);

    @Query("SELECT o FROM Order o JOIN o.items i WHERE i.product.id = :productId AND o.status <> com.tuvi.tuvi_backend.enums.OrderStatus.CANCELLED ORDER BY o.createdAt DESC")
    List<Order> findOrdersByProductId(@Param("productId") String productId);
}




