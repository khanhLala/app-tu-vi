package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.Order;
import com.tuvi.tuvi_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findAllByUser(User user);
}
