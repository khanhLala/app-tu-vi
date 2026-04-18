package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.Like;
import com.tuvi.tuvi_backend.entity.Post;
import com.tuvi.tuvi_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, String> {
    Optional<Like> findByPostAndUser(Post post, User user);
    long countByPost(Post post);
    boolean existsByPostAndUser(Post post, User user);
}
