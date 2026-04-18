package com.tuvi.tuvi_backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordChangeRequest {
    String oldPassword;
    
    @Size(min = 8, message = "INVALID_PASSWORD")
    String newPassword;

    String confirmPassword;
}
