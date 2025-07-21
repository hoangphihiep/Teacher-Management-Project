package com.teacher.managerment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkScheduleDto {
    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotBlank(message = "Work date is required")
    private String workDate;

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;

    @NotBlank(message = "Work type is required")
    private String workType;

    private String location;

    @NotBlank(message = "Content is required")
    private String content;

    private String notes;
}
