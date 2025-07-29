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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;
    private final UserRepository userRepository;

    public List<TeacherWorkSummaryDto> getAllTeachersWithWorkSummary() {
        List<User> teachers = userRepository.findByRole(User.Role.TEACHER);
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
                    totalSchedules != null ? totalSchedules : 0L, // Đảm bảo giá trị mặc định là 0L
                    unmarkedAttendance != null ? unmarkedAttendance : 0L, // Đảm bảo giá trị mặc định là 0L
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

        // Create the main schedule
        WorkSchedule workSchedule = createWorkScheduleFromDto(createDto, teacher, currentUser);
        WorkSchedule savedSchedule = workScheduleRepository.save(workSchedule);

        // If recurring, create additional schedules
        if (createDto.getIsRecurring() && createDto.getRecurringEndDate() != null && !createDto.getRecurringEndDate().isEmpty()) {
            createRecurringSchedules(savedSchedule, createDto);
        }

        return WorkScheduleDto.fromEntity(savedSchedule);
    }

    private WorkSchedule createWorkScheduleFromDto(CreateWorkScheduleDto createDto, User teacher, User currentUser) {
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
        workSchedule.setIsRecurring(createDto.getIsRecurring());

        if (createDto.getRecurringEndDate() != null && !createDto.getRecurringEndDate().isEmpty()) {
            workSchedule.setRecurringEndDate(LocalDate.parse(createDto.getRecurringEndDate()));
        } else {
            workSchedule.setRecurringEndDate(null); // Đảm bảo là null nếu không có giá trị
        }

        return workSchedule;
    }

    private void createRecurringSchedules(WorkSchedule parentSchedule, CreateWorkScheduleDto createDto) {
        LocalDate startDate = parentSchedule.getWorkDate().plusWeeks(1); // Start from next week
        LocalDate endDate = LocalDate.parse(createDto.getRecurringEndDate());

        List<WorkSchedule> recurringSchedules = new ArrayList<>();
        int weekNumber = 1;

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            WorkSchedule recurringSchedule = new WorkSchedule();
            recurringSchedule.setTeacher(parentSchedule.getTeacher());
            recurringSchedule.setWorkDate(currentDate);
            recurringSchedule.setStartTime(parentSchedule.getStartTime());
            recurringSchedule.setEndTime(parentSchedule.getEndTime());
            recurringSchedule.setWorkType(parentSchedule.getWorkType());
            recurringSchedule.setLocation(parentSchedule.getLocation());
            recurringSchedule.setContent(parentSchedule.getContent());
            recurringSchedule.setNotes(parentSchedule.getNotes());
            recurringSchedule.setCreatedBy(parentSchedule.getCreatedBy());
            recurringSchedule.setIsRecurring(false); // Child schedules are not recurring
            recurringSchedule.setParentScheduleId(parentSchedule.getId());
            recurringSchedule.setWeekNumber(weekNumber);

            recurringSchedules.add(recurringSchedule);

            currentDate = currentDate.plusWeeks(1);
            weekNumber++;
        }

        workScheduleRepository.saveAll(recurringSchedules);
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

        // If this is a parent recurring schedule, delete all child schedules
        if (workSchedule.isParentRecurring()) {
            List<WorkSchedule> childSchedules = workScheduleRepository.findByParentScheduleId(scheduleId);
            workScheduleRepository.deleteAll(childSchedules);
        }

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

    public List<WorkScheduleDto> getRecurringScheduleChildren(Long parentId) {
        List<WorkSchedule> childSchedules = workScheduleRepository.findByParentScheduleId(parentId);
        return childSchedules.stream()
                .map(WorkScheduleDto::fromEntity)
                .collect(Collectors.toList());
    }

    public WorkScheduleDto updateRecurringScheduleChild(Long scheduleId, CreateWorkScheduleDto updateDto) {
        WorkSchedule workSchedule = workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Work schedule not found"));

        if (!workSchedule.isChildRecurring()) {
            throw new RuntimeException("This is not a child recurring schedule");
        }

        return updateWorkSchedule(scheduleId, updateDto);
    }

    public void deleteRecurringScheduleChild(Long scheduleId) {
        WorkSchedule workSchedule = workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Work schedule not found"));

        if (!workSchedule.isChildRecurring()) {
            throw new RuntimeException("This is not a child recurring schedule");
        }

        workScheduleRepository.delete(workSchedule);
    }
}
