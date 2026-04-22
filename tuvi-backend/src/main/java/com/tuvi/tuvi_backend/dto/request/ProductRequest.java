package com.tuvi.tuvi_backend.dto.request;

import com.tuvi.tuvi_backend.entity.ProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    String name;

    @NotNull(message = "Giá sản phẩm không được để trống")
    BigDecimal price;

    String description;
    String imageUrl;
    String category;
    ProductType type;
}
