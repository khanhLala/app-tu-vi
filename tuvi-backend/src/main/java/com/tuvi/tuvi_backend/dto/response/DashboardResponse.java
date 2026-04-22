package com.tuvi.tuvi_backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardResponse {
    long totalUsers;
    long newUsersToday;
    
    long totalPosts;
    long newPostsToday;
    
    BigDecimal totalRevenue;
    BigDecimal revenueToday;
    
    long pendingReports;
}
