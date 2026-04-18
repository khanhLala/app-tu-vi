package com.tuvi.tuvi_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TuViProfileResponse {
    String id;
    
    @JsonProperty("personal_info")
    PersonalInfo personalInfo;
    
    @JsonProperty("full_data")
    Object fullData; // Chứa toàn bộ dữ liệu lá số (palaces, ai_prompt, etc.)
    
    String lastSearchTime;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PersonalInfo {
        String name;
        @JsonProperty("solar_date")
        String solarDate;
        @JsonProperty("am_duong_nam_nu")
        String amDuongNamNu;
        
        // Cần lưu lại các field input để khi click vào xem chi tiết có thể tái tạo lại lá số
        int day;
        int month;
        int year;
        int hour;
        int minute;
        int gender;
        @JsonProperty("is_lunar")
        boolean isLunar;
    }
}
