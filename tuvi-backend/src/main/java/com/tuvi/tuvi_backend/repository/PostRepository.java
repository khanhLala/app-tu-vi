package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {
    // Chỉ lấy bài viết chưa bị xóa mềm (isDeleted = false)
    List<Post> findAllByIsDeletedFalseOrderByCreatedAtDesc();

    // Đếm bài viết mới trong khoảng thời gian (chỉ bài chưa xóa)
    long countByCreatedAtAfterAndIsDeletedFalse(LocalDateTime date);

    // Đếm tổng số bài viết chưa xóa
    long countByIsDeletedFalse();
}

