package com.teacher.managerment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableTimeSlotDto {
    private Long id;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String description;
    private Boolean isRecurring;
}