package com.tuvi.tuvi_backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tuvi.tuvi_backend.dto.request.TuViRequest;
import com.tuvi.tuvi_backend.dto.response.TuViProfileResponse;
import com.tuvi.tuvi_backend.entity.TuViProfile;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.exception.AppException;
import com.tuvi.tuvi_backend.enums.ErrorCode;
import com.tuvi.tuvi_backend.repository.TuViProfileRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TuViService {

    final RestTemplate restTemplate;
    final UserRepository userRepository;
    final TuViProfileRepository tuViProfileRepository;
    final ObjectMapper objectMapper;

    private static final String PYTHON_SERVICE_URL = "http://localhost:8000/api/v1/chart";

    @Transactional
    public Object generateChart(TuViRequest request) {
        try {
            Object response = restTemplate.postForObject(PYTHON_SERVICE_URL, request, Object.class);
            
            // Lưu thông tin profile nếu người dùng đang đăng nhập
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            log.info("Bắt đầu xử lý lưu lịch sử cho user: {}", username);

            if (username != null && !username.equals("anonymousUser")) {
                userRepository.findByUsername(username).ifPresentOrElse(user -> {
                    saveToHistory(user, request, response);
                    log.info("Lưu lịch sử thành công cho user: {}", username);
                }, () -> {
                    log.warn("Không tìm thấy User trong DB để lưu lịch sử: {}", username);
                });
            } else {
                log.warn("User chưa đăng nhập hoặc anonymous, không lưu lịch sử");
            }
            
            return response;
        } catch (Exception e) {
            log.error("Lỗi khi lập lá số hoặc lưu lịch sử: ", e);
            throw new RuntimeException("Lỗi kết nối microservice Tử Vi: " + e.getMessage());
        }
    }

    public List<TuViProfileResponse> getHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return tuViProfileRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteHistory(String id) {
        TuViProfile profile = tuViProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi lịch sử"));
        
        // Kiểm tra quyền sở hữu
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!profile.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED); // Hoặc ACCESS_DENIED nếu có
        }

        tuViProfileRepository.delete(profile);
    }

    @Transactional
    public void clearAllHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        tuViProfileRepository.deleteAllByUser(user);
    }

    private void saveToHistory(User user, TuViRequest request, Object response) {
        String chartJson = "{}";
        try {
            chartJson = objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException e) {
            log.error("Lỗi khi serialize kết quả lá số sang JSON: ", e);
        }

        TuViProfile profile = TuViProfile.builder()
                .name(request.getName())
                .day(request.getDay())
                .month(request.getMonth())
                .year(request.getYear())
                .hour(request.getHour())
                .minute(request.getMinute())
                .gender(request.getGender())
                .isLunar(request.isLunar())
                .chartData(chartJson) // Lưu toàn bộ JSON response
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        tuViProfileRepository.save(profile);
    }

    private TuViProfileResponse mapToResponse(TuViProfile profile) {
        String solarDateStr = String.format("Ngày %d/%d/%d", profile.getDay(), profile.getMonth(), profile.getYear());
        String amDuongNamNu = (profile.getGender() == 1 ? "Dương Nam" : "Âm Nữ");

        // Parse ngược JSON từ DB sang Object để gửi về Mobile
        Object fullData = null;
        try {
            if (profile.getChartData() != null) {
                fullData = objectMapper.readValue(profile.getChartData(), Object.class);
            }
        } catch (JsonProcessingException e) {
            log.error("Lỗi khi deserialize chartData từ DB: ", e);
        }

        return TuViProfileResponse.builder()
                .id(profile.getId())
                .lastSearchTime(profile.getCreatedAt().toString())
                .fullData(fullData) // Data đầy đủ cho ChartDetail
                .personalInfo(TuViProfileResponse.PersonalInfo.builder()
                        .name(profile.getName())
                        .solarDate(solarDateStr)
                        .amDuongNamNu(amDuongNamNu)
                        .day(profile.getDay())
                        .month(profile.getMonth())
                        .year(profile.getYear())
                        .hour(profile.getHour())
                        .minute(profile.getMinute())
                        .gender(profile.getGender())
                        .isLunar(profile.isLunar())
                        .build())
                .build();
    }
}
