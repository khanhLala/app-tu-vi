package com.tuvi.tuvi_backend.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    String id;
    String name;
    BigDecimal price;
    String description;
    String imageUrl;
    String category;
    String type;
    LocalDateTime createdAt;
}
