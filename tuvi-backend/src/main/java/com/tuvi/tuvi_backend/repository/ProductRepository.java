package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
}
