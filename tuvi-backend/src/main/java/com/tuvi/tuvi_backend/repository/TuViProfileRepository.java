package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.TuViProfile;
import com.tuvi.tuvi_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TuViProfileRepository extends JpaRepository<TuViProfile, String> {
    List<TuViProfile> findAllByUserOrderByCreatedAtDesc(User user);
    void deleteAllByUser(User user);
    long countByCreatedAtAfter(LocalDateTime dateTime);
}
