package com.teacher.managerment.dto.request;

import com.teacher.managerment.dto.AvailableTimeSlotDto;
import com.teacher.managerment.dto.CertificationDto;
import com.teacher.managerment.dto.EducationDto;
import com.teacher.managerment.dto.ExperienceDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private String position;
    private String department;
    private String bio;
    private List<String> subjects;
    private List<String> skills;
    private List<String> hobbies;
    private List<EducationDto> educations;
    private List<ExperienceDto> experiences;
    private List<CertificationDto> certifications;
    private List<AvailableTimeSlotDto> availableTimeSlots;
}
