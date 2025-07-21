package com.teacher.managerment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestStatsDto {
    private int totalRequests;
    private int pendingRequests;
    private int activeLeaves;
}
