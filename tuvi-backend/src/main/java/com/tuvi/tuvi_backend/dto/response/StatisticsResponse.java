package com.tuvi.tuvi_backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticsResponse {
    StatDetail userStats;
    StatDetail productStats;
    StatDetail tuViStats;
    StatDetail postStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class StatDetail {
        long total;
        long today;
    }
}
