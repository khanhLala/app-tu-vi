package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.Notification;
import com.tuvi.tuvi_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findAllByRecipientOrderByCreatedAtDesc(User recipient);
    void deleteAllByRecipient(User recipient);
}
