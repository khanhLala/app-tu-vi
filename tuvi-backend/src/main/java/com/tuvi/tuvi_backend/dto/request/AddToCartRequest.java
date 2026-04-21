package com.tuvi.tuvi_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddToCartRequest {
    @NotBlank(message = "Product ID cannot be blank")
    String productId;

    @Min(value = 1, message = "Quantity must be at least 1")
    Integer quantity;
}
