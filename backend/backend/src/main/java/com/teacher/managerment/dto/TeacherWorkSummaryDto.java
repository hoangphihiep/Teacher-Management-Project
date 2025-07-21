package com.teacher.managerment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherWorkSummaryDto {
    private Long teacherId;
    private String teacherName;
    private String teacherEmail;
    private Double totalHoursThisWeek;
    private Long totalSchedulesThisWeek;
    private Long unmarkedAttendance;
    private LocalDateTime lastUpdated;
}
