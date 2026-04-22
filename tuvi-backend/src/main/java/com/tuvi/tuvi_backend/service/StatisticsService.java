package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.dto.response.StatisticsResponse;
import com.tuvi.tuvi_backend.repository.PostRepository;
import com.tuvi.tuvi_backend.repository.ProductRepository;
import com.tuvi.tuvi_backend.repository.TuViProfileRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatisticsService {
    UserRepository userRepository;
    ProductRepository productRepository;
    TuViProfileRepository tuViProfileRepository;
    PostRepository postRepository;

    public StatisticsResponse getSummaryStats() {
        LocalDateTime startOfToday = LocalDateTime.now().with(LocalTime.MIN);

        return StatisticsResponse.builder()
                .userStats(StatisticsResponse.StatDetail.builder()
                        .total(userRepository.count())
                        .today(userRepository.countByCreatedAtAfter(startOfToday))
                        .build())
                .productStats(StatisticsResponse.StatDetail.builder()
                        .total(productRepository.count())
                        .today(productRepository.countByCreatedAtAfter(startOfToday))
                        .build())
                .tuViStats(StatisticsResponse.StatDetail.builder()
                        .total(tuViProfileRepository.count())
                        .today(tuViProfileRepository.countByCreatedAtAfter(startOfToday))
                        .build())
                .postStats(StatisticsResponse.StatDetail.builder()
                        .total(postRepository.count())
                        .today(postRepository.countByCreatedAtAfter(startOfToday))
                        .build())
                .build();
    }
}
