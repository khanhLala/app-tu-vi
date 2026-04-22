package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.dto.response.ReportResponse;
import com.tuvi.tuvi_backend.entity.Report;
import com.tuvi.tuvi_backend.enums.ReportStatus;
import com.tuvi.tuvi_backend.repository.ReportRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportService {
    ReportRepository reportRepository;

    public List<ReportResponse> getReportsByStatus(ReportStatus status) {
        return reportRepository.findAllByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToReportResponse)
                .collect(Collectors.toList());
    }

    public void updateReportStatus(String reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));
        report.setStatus(status);
        reportRepository.save(report);
    }

    private ReportResponse mapToReportResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .reason(report.getReason())
                .reporterName(report.getReporter().getFirstName() + " " + report.getReporter().getLastName())
                .reporterUsername(report.getReporter().getUsername())
                .postId(report.getPost().getId())
                .postContentPreview(report.getPost().getContent().substring(0, Math.min(report.getPost().getContent().length(), 100)))
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
