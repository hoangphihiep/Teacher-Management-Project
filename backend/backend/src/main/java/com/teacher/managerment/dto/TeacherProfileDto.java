package com.teacher.managerment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherProfileDto {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private String position;
    private String department;
    private LocalDate startDate;
    private String avatarUrl;
    private String bio;
    private List<String> subjects;
    private List<String> skills;
    private List<String> hobbies;
    private String role;

    // Related entities
    private List<EducationDto> educations;
    private List<ExperienceDto> experiences;
    private List<CertificationDto> certifications;
    private List<AvailableTimeSlotDto> availableTimeSlots;
}
