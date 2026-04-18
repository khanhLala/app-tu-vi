package com.tuvi.tuvi_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    String firstName;
    String lastName;
    LocalDate dob;
    
    @Size(min = 10, max = 15, message = "Số điện thoại không hợp lệ")
    String phone;
    
    @Email(message = "EMAIL_INVALID")
    String email;
    
    String address;
}
