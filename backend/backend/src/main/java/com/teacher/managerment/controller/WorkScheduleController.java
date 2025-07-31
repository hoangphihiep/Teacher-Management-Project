package com.teacher.managerment.controller;

import com.teacher.managerment.dto.*;
import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.entity.WorkSchedule;
import com.teacher.managerment.service.WorkScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/work-schedules")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
//@CrossOrigin(origins = "https://teacher-management-project-4r41.vercel.app")
public class WorkScheduleController {

    private final WorkScheduleService workScheduleService;

    @GetMapping("/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TeacherWorkSummaryDto>>> getAllTeachersWithWorkSummary() {
        List<TeacherWorkSummaryDto> teachers = workScheduleService.getAllTeachersWithWorkSummary();
        return ResponseEntity.ok(new ApiResponse<>(true, "Teachers retrieved successfully", teachers));
    }

    @GetMapping("/teacher/{teacherId}/week")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<WorkScheduleDto>>> getTeacherWeeklySchedule(
            @PathVariable Long teacherId,
            @RequestParam String weekStart) {
        System.out.println ("Thời gian: " + weekStart + " id giáo viên: " + teacherId);
        List<WorkScheduleDto> schedules = workScheduleService.getTeacherWeeklySchedule(teacherId, weekStart);
        return ResponseEntity.ok(new ApiResponse<>(true, "Teacher schedule retrieved successfully", schedules));
    }

    @GetMapping("/my-schedule")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN') or hasRole('ASSISTANT')")
    public ResponseEntity<ApiResponse<List<WorkScheduleDto>>> getMyWeeklySchedule(
            @RequestParam String weekStart) {
        List<WorkScheduleDto> schedules = workScheduleService.getMyWeeklySchedule(weekStart);
        return ResponseEntity.ok(new ApiResponse<>(true, "My schedule retrieved successfully", schedules));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkScheduleDto>> createWorkSchedule(
            @Valid @RequestBody CreateWorkScheduleDto createDto) {
        WorkScheduleDto created = workScheduleService.createWorkSchedule(createDto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Work schedule created successfully", created));
    }

    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkScheduleDto>> updateWorkSchedule(
            @PathVariable Long scheduleId,
            @Valid @RequestBody CreateWorkScheduleDto updateDto) {
        WorkScheduleDto updated = workScheduleService.updateWorkSchedule(scheduleId, updateDto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Work schedule updated successfully", updated));
    }

    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWorkSchedule(@PathVariable Long scheduleId) {
        workScheduleService.deleteWorkSchedule(scheduleId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Work schedule deleted successfully", null));
    }

    @PostMapping("/{scheduleId}/attendance")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkScheduleDto>> markAttendance(
            @PathVariable Long scheduleId,
            @Valid @RequestBody AttendanceMarkDto attendanceDto) {
        WorkScheduleDto updated = workScheduleService.markAttendance(scheduleId, attendanceDto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance marked successfully", updated));
    }

    @GetMapping("/{scheduleId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkScheduleDto>> getWorkScheduleById(@PathVariable Long scheduleId) {
        WorkScheduleDto schedule = workScheduleService.getWorkScheduleById(scheduleId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Work schedule retrieved successfully", schedule));
    }

    // Recurring schedule endpoints
    @GetMapping("/{parentId}/recurring-children")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<WorkScheduleDto>>> getRecurringScheduleChildren(
            @PathVariable Long parentId) {
        List<WorkScheduleDto> children = workScheduleService.getRecurringScheduleChildren(parentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Recurring schedule children retrieved successfully", children));
    }

    @PutMapping("/recurring/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WorkScheduleDto>> updateRecurringScheduleChild(
            @PathVariable Long scheduleId,
            @Valid @RequestBody CreateWorkScheduleDto updateDto) {
        WorkScheduleDto updated = workScheduleService.updateRecurringScheduleChild(scheduleId, updateDto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Recurring schedule child updated successfully", updated));
    }

    @DeleteMapping("/recurring/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRecurringScheduleChild(@PathVariable Long scheduleId) {
        workScheduleService.deleteRecurringScheduleChild(scheduleId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Recurring schedule child deleted successfully", null));
    }

    @GetMapping("/work-types")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWorkTypes() {
        List<Map<String, String>> workTypes = Arrays.stream(WorkSchedule.WorkType.values())
                .map(type -> Map.of(
                        "value", type.name(),
                        "label", type.getDisplayName(),
                        "color", type.getColor()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, "Work types retrieved successfully",
                Map.of("workTypes", workTypes)));
    }

    @GetMapping("/attendance-statuses")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceStatuses() {
        List<Map<String, String>> attendanceStatuses = Arrays.stream(WorkSchedule.AttendanceStatus.values())
                .map(status -> Map.of(
                        "value", status.name(),
                        "label", status.getDisplayName()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance statuses retrieved successfully",
                Map.of("attendanceStatuses", attendanceStatuses)));
    }
}
