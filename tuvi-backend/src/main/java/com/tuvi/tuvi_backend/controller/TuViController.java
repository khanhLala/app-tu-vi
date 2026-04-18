package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.dto.request.TuViRequest;
import com.tuvi.tuvi_backend.dto.response.TuViProfileResponse;
import com.tuvi.tuvi_backend.service.TuViService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tuvi")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TuViController {

    TuViService tuViService;

    @PostMapping("/generate")
    public ApiResponse<Object> generateChart(@RequestBody TuViRequest request) {
        return ApiResponse.<Object>builder()
                .result(tuViService.generateChart(request))
                .build();
    }

    @GetMapping("/history")
    public ApiResponse<List<TuViProfileResponse>> getHistory() {
        return ApiResponse.<List<TuViProfileResponse>>builder()
                .result(tuViService.getHistory())
                .build();
    }

    @DeleteMapping("/history/{id}")
    public ApiResponse<Void> deleteHistory(@PathVariable String id) {
        tuViService.deleteHistory(id);
        return ApiResponse.<Void>builder()
                .message("Xóa lịch sử thành công")
                .build();
    }

    @DeleteMapping("/history")
    public ApiResponse<Void> clearAllHistory() {
        tuViService.clearAllHistory();
        return ApiResponse.<Void>builder()
                .message("Xóa sạch lịch sử thành công")
                .build();
    }
}
