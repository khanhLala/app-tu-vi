package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.dto.response.ReportResponse;
import com.tuvi.tuvi_backend.enums.ReportStatus;
import com.tuvi.tuvi_backend.service.ReportService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportController {
    ReportService reportService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ReportResponse>> getReports(@RequestParam ReportStatus status) {
        return ApiResponse.<List<ReportResponse>>builder()
                .result(reportService.getReportsByStatus(status))
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> updateReportStatus(@PathVariable String id, @RequestParam ReportStatus status) {
        reportService.updateReportStatus(id, status);
        return ApiResponse.<Void>builder()
                .message("Trạng thái báo cáo đã được cập nhật")
                .build();
    }
}
