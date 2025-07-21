package com.teacher.managerment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceDto {
    private Long id;
    private String position;
    private String company;
    private String startPeriod;
    private String endPeriod;
    private String description;
    private Boolean isCurrent;
}
