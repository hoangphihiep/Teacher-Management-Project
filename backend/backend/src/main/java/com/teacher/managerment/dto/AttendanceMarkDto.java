package com.teacher.managerment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceMarkDto {
    @NotBlank(message = "Attendance status is required")
    private String attendanceStatus;

    private String attendanceNotes;
}
