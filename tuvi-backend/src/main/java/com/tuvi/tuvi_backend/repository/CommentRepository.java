package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.Comment;
import com.tuvi.tuvi_backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findAllByPostOrderByCreatedAtAsc(Post post);
}
