package com.tuvi.tuvi_backend.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse {
    String id;
    String productId;
    String productName;
    String productImageUrl;
    BigDecimal productPrice;
    Integer quantity;
}
