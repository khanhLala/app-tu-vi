package com.tuvi.tuvi_backend.enums;

import org.springframework.http.HttpStatus;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Mã lỗi không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "Người dùng đã tồn tại", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Tên đăng nhập phải chứa ít nhất 3 ký tự", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Mật khẩu phải chứa ít nhất 8 ký tự", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Tên đăng nhập hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    EMAIL_INVALID(1008, "Định dạng email không hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_INCORRECT(1009, "Mật khẩu cũ không chính xác", HttpStatus.BAD_REQUEST),
    PASSWORDS_NOT_MATCH(1010, "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    POST_NOT_EXISTED(1011, "Bài viết không tồn tại", HttpStatus.NOT_FOUND),
    CANNOT_REPORT_OWN_POST(1012, "Bạn không thể tự báo cáo bài viết của mình", HttpStatus.BAD_REQUEST),
    ;


    ErrorCode(int code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    int code;
    String message;
    HttpStatus statusCode;
}
