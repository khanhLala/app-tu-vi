package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.Order;
import com.tuvi.tuvi_backend.entity.Product;
import com.tuvi.tuvi_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i WHERE o.user.id = :userId AND o.status = :status AND i.product.id = :productId")
    boolean hasPurchasedProduct(@org.springframework.data.repository.query.Param("userId") String userId, 
                                @org.springframework.data.repository.query.Param("status") String status, 
                                @org.springframework.data.repository.query.Param("productId") String productId);
}
