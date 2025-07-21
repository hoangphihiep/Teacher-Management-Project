package com.teacher.managerment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateCourseAssignmentDto {
    @NotNull(message = "ID môn học không được để trống")
    private Long courseId;

    @NotNull(message = "ID giáo viên không được để trống")
    private Long teacherId;
}
