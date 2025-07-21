package com.teacher.managerment.service;

import com.teacher.managerment.dto.*;
import com.teacher.managerment.dto.request.UpdateProfileRequest;
import com.teacher.managerment.entity.*;
import com.teacher.managerment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TeacherProfileService {

    @Autowired
    private TeacherProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private AvailableTimeSlotRepository availableTimeSlotRepository;

    public TeacherProfileDto getProfileByUsername(String username) {
        System.out.println ("Tên1: " + username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        System.out.println ("tên user: " + user.getUsername());
        System.out.println ("id user: " + user.getId());
        TeacherProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> createDefaultProfile(user));

        return convertToDto(profile);
    }

    public TeacherProfileDto getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        TeacherProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> createDefaultProfile(user));

        return convertToDto(profile);
    }

    public TeacherProfileDto getCurrentUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeacherProfile profile = profileRepository.findByUser(user)
                .orElse(createDefaultProfile(user));

        return convertToDto(profile);
    }

    public TeacherProfileDto updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        TeacherProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> createDefaultProfile(user));

        // Update user info
        user.setFullName(request.getFullName());
        userRepository.save(user);

        // Update profile info
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setPosition(request.getPosition());
        profile.setDepartment(request.getDepartment());
        profile.setBio(request.getBio());
        profile.setSubjects(request.getSubjects());
        profile.setSkills(request.getSkills());
        profile.setHobbies(request.getHobbies());

        profile = profileRepository.save(profile);

        if (request.getEducations() != null) {
            updateEducations(profile, request.getEducations());
        }

        // Update experiences
        if (request.getExperiences() != null) {
            updateExperiences(profile, request.getExperiences());
        }

        // Update certifications
        if (request.getCertifications() != null) {
            updateCertifications(profile, request.getCertifications());
        }

        // Update available time slots
        if (request.getAvailableTimeSlots() != null) {
            updateAvailableTimeSlots(profile, request.getAvailableTimeSlots());
        }

        return convertToDto(profile);
    }

    private void updateEducations(TeacherProfile profile, List<EducationDto> educationDtos) {
        // Delete existing educations
        educationRepository.deleteByProfile(profile);

        // Add new educations
        for (EducationDto dto : educationDtos) {
            if (dto.getDegree() != null && !dto.getDegree().trim().isEmpty()) {
                Education education = new Education();
                education.setProfile(profile);
                education.setDegree(dto.getDegree());
                education.setUniversity(dto.getUniversity());
                education.setStartYear(dto.getStartYear());
                education.setEndYear(dto.getEndYear());
                education.setGpa(dto.getGpa());
                education.setDescription(dto.getDescription());
                educationRepository.save(education);
            }
        }
    }
    private void updateExperiences(TeacherProfile profile, List<ExperienceDto> experienceDtos) {
        // Delete existing experiences
        experienceRepository.deleteByProfile(profile);

        // Add new experiences
        for (ExperienceDto dto : experienceDtos) {
            if (dto.getPosition() != null && !dto.getPosition().trim().isEmpty()) {
                Experience experience = new Experience();
                experience.setProfile(profile);
                experience.setPosition(dto.getPosition());
                experience.setCompany(dto.getCompany());
                experience.setStartPeriod(dto.getStartPeriod());
                experience.setEndPeriod(dto.getEndPeriod());
                experience.setDescription(dto.getDescription());
                experience.setIsCurrent(dto.getIsCurrent());
                experienceRepository.save(experience);
            }
        }
    }

    private void updateCertifications(TeacherProfile profile, List<CertificationDto> certificationDtos) {
        // Delete existing certifications
        certificationRepository.deleteByProfile(profile);

        // Add new certifications
        for (CertificationDto dto : certificationDtos) {
            if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
                Certification certification = new Certification();
                certification.setProfile(profile);
                certification.setName(dto.getName());
                certification.setIssuer(dto.getIssuer());
                certification.setIssueYear(dto.getIssueYear());
                certification.setExpiryYear(dto.getExpiryYear());
                certification.setCredentialId(dto.getCredentialId());
                certification.setDescription(dto.getDescription());
                certificationRepository.save(certification);
            }
        }
    }

    private void updateAvailableTimeSlots(TeacherProfile profile, List<AvailableTimeSlotDto> timeSlotDtos) {
        // Delete existing time slots
        availableTimeSlotRepository.deleteByProfile(profile);

        // Add new time slots
        List<AvailableTimeSlot> timeSlots = timeSlotDtos.stream()
                .map(dto -> {
                    AvailableTimeSlot timeSlot = new AvailableTimeSlot();
                    timeSlot.setProfile(profile);
                    timeSlot.setDayOfWeek(AvailableTimeSlot.DayOfWeek.valueOf(dto.getDayOfWeek()));
                    timeSlot.setStartTime(LocalTime.parse(dto.getStartTime()));
                    timeSlot.setEndTime(LocalTime.parse(dto.getEndTime()));
                    timeSlot.setDescription(dto.getDescription());
                    timeSlot.setIsRecurring(dto.getIsRecurring() != null ? dto.getIsRecurring() : true);
                    return timeSlot;
                })
                .collect(Collectors.toList());

        availableTimeSlotRepository.saveAll(timeSlots);
    }

    private TeacherProfile createDefaultProfile(User user) {
        TeacherProfile profile = new TeacherProfile();
        profile.setUser(user);
        profile.setPosition("Giáo viên");
        profile.setDepartment("Chưa xác định");
        return profileRepository.save(profile);
    }

    private TeacherProfileDto convertToDto(TeacherProfile profile) {
        TeacherProfileDto dto = new TeacherProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setUsername(profile.getUser().getUsername());
        dto.setFullName(profile.getUser().getFullName());
        dto.setEmail(profile.getUser().getEmail());
        dto.setRole(profile.getUser().getRole().name());
        dto.setPhone(profile.getPhone());
        dto.setAddress(profile.getAddress());
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setGender(profile.getGender());
        dto.setPosition(profile.getPosition());
        dto.setDepartment(profile.getDepartment());
        dto.setStartDate(profile.getStartDate());
        dto.setAvatarUrl(profile.getAvatarUrl());
        dto.setBio(profile.getBio());
        dto.setSubjects(profile.getSubjects());
        dto.setSkills(profile.getSkills());
        dto.setHobbies(profile.getHobbies());

        // Load related entities
        List<Education> educations = educationRepository.findByProfileOrderByEndYearDesc(profile);
        dto.setEducations(educations.stream().map(this::convertEducationToDto).collect(Collectors.toList()));

        List<Experience> experiences = experienceRepository.findByProfileOrderByIsCurrentDescStartPeriodDesc(profile);
        dto.setExperiences(experiences.stream().map(this::convertExperienceToDto).collect(Collectors.toList()));

        List<Certification> certifications = certificationRepository.findByProfileOrderByIssueYearDesc(profile);
        dto.setCertifications(certifications.stream().map(this::convertCertificationToDto).collect(Collectors.toList()));

        List<AvailableTimeSlot> timeSlots = availableTimeSlotRepository.findByProfileOrderByDayOfWeekAscStartTimeAsc(profile);
        dto.setAvailableTimeSlots(timeSlots.stream().map(this::convertTimeSlotToDto).collect(Collectors.toList()));

        return dto;
    }

    private EducationDto convertEducationToDto(Education education) {
        EducationDto dto = new EducationDto();
        dto.setId(education.getId());
        dto.setDegree(education.getDegree());
        dto.setUniversity(education.getUniversity());
        dto.setStartYear(education.getStartYear());
        dto.setEndYear(education.getEndYear());
        dto.setGpa(education.getGpa());
        dto.setDescription(education.getDescription());
        return dto;
    }

    private ExperienceDto convertExperienceToDto(Experience experience) {
        ExperienceDto dto = new ExperienceDto();
        dto.setId(experience.getId());
        dto.setPosition(experience.getPosition());
        dto.setCompany(experience.getCompany());
        dto.setStartPeriod(experience.getStartPeriod());
        dto.setEndPeriod(experience.getEndPeriod());
        dto.setDescription(experience.getDescription());
        dto.setIsCurrent(experience.getIsCurrent());
        return dto;
    }

    private CertificationDto convertCertificationToDto(Certification certification) {
        CertificationDto dto = new CertificationDto();
        dto.setId(certification.getId());
        dto.setName(certification.getName());
        dto.setIssuer(certification.getIssuer());
        dto.setIssueYear(certification.getIssueYear());
        dto.setExpiryYear(certification.getExpiryYear());
        dto.setCredentialId(certification.getCredentialId());
        dto.setDescription(certification.getDescription());
        return dto;
    }

    private AvailableTimeSlotDto convertTimeSlotToDto(AvailableTimeSlot timeSlot) {
        AvailableTimeSlotDto dto = new AvailableTimeSlotDto();
        dto.setId(timeSlot.getId());
        dto.setDayOfWeek(timeSlot.getDayOfWeek().name());
        dto.setStartTime(timeSlot.getStartTime().toString());
        dto.setEndTime(timeSlot.getEndTime().toString());
        dto.setDescription(timeSlot.getDescription());
        dto.setIsRecurring(timeSlot.getIsRecurring());
        return dto;
    }
}
