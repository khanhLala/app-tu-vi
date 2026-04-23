package com.tuvi.tuvi_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
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
    
    @Pattern(regexp = "^$|[0-9]{10,15}", message = "PHONE_INVALID")
    String phone;
    
    @Email(message = "EMAIL_INVALID")
    String email;
    
    String address;
    java.util.Set<String> roles;
}

