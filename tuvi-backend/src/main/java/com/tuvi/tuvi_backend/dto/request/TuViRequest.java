package com.tuvi.tuvi_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TuViRequest {
    String name;
    int day;
    int month;
    int year;
    int hour;
    int minute;
    int gender;

    @JsonProperty("is_lunar")
    boolean isLunar;

    @JsonProperty("view_year")
    Integer viewYear;
}
