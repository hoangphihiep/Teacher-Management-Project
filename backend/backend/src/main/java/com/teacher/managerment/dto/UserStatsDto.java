package com.teacher.managerment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDto {
    private int totalUsers;
    private int activeUsers;
    private int teachers;
    private int admins;
}
