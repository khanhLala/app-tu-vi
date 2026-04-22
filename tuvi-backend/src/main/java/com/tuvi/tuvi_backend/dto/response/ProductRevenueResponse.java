package com.tuvi.tuvi_backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductRevenueResponse {
    String productId;
    String productName;
    String imageUrl;
    BigDecimal revenue;
}
