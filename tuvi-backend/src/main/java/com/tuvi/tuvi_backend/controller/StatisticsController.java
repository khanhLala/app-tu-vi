package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.dto.response.StatisticsResponse;
import com.tuvi.tuvi_backend.service.StatisticsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {
    StatisticsService statisticsService;

    @GetMapping("/summary")
    public ApiResponse<StatisticsResponse> getSummary() {
        return ApiResponse.<StatisticsResponse>builder()
                .result(statisticsService.getSummaryStats())
                .build();
    }
}
