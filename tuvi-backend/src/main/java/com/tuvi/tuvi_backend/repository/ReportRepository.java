package com.tuvi.tuvi_backend.repository;

import com.tuvi.tuvi_backend.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findAllByStatusOrderByCreatedAtDesc(String status);
}
