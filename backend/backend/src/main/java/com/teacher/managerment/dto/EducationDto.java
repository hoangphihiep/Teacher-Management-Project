package com.teacher.managerment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationDto {
    private Long id;
    private String degree;
    private String university;
    private String startYear;
    private String endYear;
    private String gpa;
    private String description;
}
