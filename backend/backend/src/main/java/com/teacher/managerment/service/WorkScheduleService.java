package com.teacher.managerment.service;

import com.teacher.managerment.dto.*;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.entity.WorkSchedule;
import com.teacher.managerment.repository.UserRepository;
import com.teacher.managerment.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;
    private final UserRepository userRepository;

    public List<TeacherWorkSummaryDto> getAllTeachersWithWorkSummary() {
        List<User> teachers = workScheduleRepository.findDistinctTeachers();
        //Dòng này có vấn đề
        LocalDate weekStart = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1);
        LocalDate weekEnd = weekStart.plusDays(6);

        return teachers.stream().map(teacher -> {
            Double totalHours = workScheduleRepository.sumHoursByTeacherIdAndDateRange(
                    teacher.getId(), weekStart, weekEnd);
            Long totalSchedules = workScheduleRepository.countByTeacherIdAndDateRange(
                    teacher.getId(), weekStart, weekEnd);
            Long unmarkedAttendance = workScheduleRepository.countUnmarkedAttendanceByTeacherId(teacher.getId());

            return new TeacherWorkSummaryDto(
                    teacher.getId(),
                    teacher.getFullName(),
                    teacher.getEmail(),
                    totalHours != null ? totalHours : 0.0,
                    totalSchedules,
                    unmarkedAttendance,
                    java.time.LocalDateTime.now()
            );
        }).collect(Collectors.toList());
    }

    public List<WorkScheduleDto> getTeacherWeeklySchedule(Long teacherId, String weekStart) {
        LocalDate startDate = LocalDate.parse(weekStart);
        LocalDate endDate = startDate.plusDays(6);

        System.out.println ("Thời gian bắt đầu: " + startDate + " thời gian kết thúc: " + endDate);
        List<WorkSchedule> schedules = workScheduleRepository.findByTeacherIdAndDateRange(
                teacherId, startDate, endDate);

        for (WorkSchedule w : schedules) {
            System.out.println("teacher: " + w.getTeacher() + "khoảng thời gian: " + w.getLocation() + " thời gian bắt đầu: " + w.getStartTime() + " thời gian kết thúc: " + w.getEndTime() + "khoảng thời gian: " + w.getDuration());
        }
        return schedules.stream()
                .map(WorkScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<WorkScheduleDto> getMyWeeklySchedule(String weekStart) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return getTeacherWeeklySchedule(currentUser.getId(), weekStart);
    }

    public WorkScheduleDto createWorkSchedule(CreateWorkScheduleDto createDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User teacher = userRepository.findById(createDto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        WorkSchedule workSchedule = new WorkSchedule();
        workSchedule.setTeacher(teacher);
        workSchedule.setWorkDate(LocalDate.parse(createDto.getWorkDate()));
        workSchedule.setStartTime(LocalTime.parse(createDto.getStartTime()));
        workSchedule.setEndTime(LocalTime.parse(createDto.getEndTime()));
        workSchedule.setWorkType(WorkSchedule.WorkType.valueOf(createDto.getWorkType()));
        workSchedule.setLocation(createDto.getLocation());
        workSchedule.setContent(createDto.getContent());
        workSchedule.setNotes(createDto.getNotes());
        workSchedule.setCreatedBy(currentUser);

        WorkSchedule saved = workScheduleRepository.save(workSchedule);
        return WorkScheduleDto.fromEntity(saved);
    }

    public WorkScheduleDto updateWorkSchedule(Long scheduleId, CreateWorkScheduleDto updateDto) {
        WorkSchedule workSchedule = workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Work schedule not found"));

        User teacher = userRepository.findById(updateDto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        workSchedule.setTeacher(teacher);
        workSchedule.setWorkDate(LocalDate.parse(updateDto.getWorkDate()));
        workSchedule.setStartTime(LocalTime.parse(updateDto.getStartTime()));
        workSchedule.setEndTime(LocalTime.parse(updateDto.getEndTime()));
        workSchedule.setWorkType(WorkSchedule.WorkType.valueOf(updateDto.getWorkType()));
        workSchedule.setLocation(updateDto.getLocation());
        workSchedule.setContent(updateDto.getContent());
        workSchedule.setNotes(updateDto.getNotes());

        WorkSchedule saved = workScheduleRepository.save(workSchedule);
        return WorkScheduleDto.fromEntity(saved);
    }

    public void deleteWorkSchedule(Long scheduleId) {
        WorkSchedule workSchedule = workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Work schedule not found"));
        workScheduleRepository.delete(workSchedule);
    }

    public WorkScheduleDto markAttendance(Long scheduleId, AttendanceMarkDto attendanceDto) {
        WorkSchedule workSchedule = workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Work schedule not found"));

        workSchedule.setAttendanceStatus(WorkSchedule.AttendanceStatus.valueOf(attendanceDto.getAttendanceStatus()));
        workSchedule.setAttendanceNotes(attendanceDto.getAttendanceNotes());

        WorkSchedule saved = workScheduleRepository.save(workSchedule);
        return WorkScheduleDto.fromEntity(saved);
    }

    public WorkScheduleDto getWorkScheduleById(Long scheduleId) {
        WorkSchedule workSchedule = workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Work schedule not found"));
        return WorkScheduleDto.fromEntity(workSchedule);
    }
}
