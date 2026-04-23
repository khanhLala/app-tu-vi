package com.tuvi.tuvi_backend.enums;

public enum OrderStatus {
    PENDING,    // Chờ xác nhận
    SHIPPING,   // Đang giao hàng
    DELIVERED,  // Đã giao hàng (Admin xác nhận)
    COMPLETED,  // Đã nhận hàng (User xác nhận)
    CANCELLED   // Đã hủy đơn
}
