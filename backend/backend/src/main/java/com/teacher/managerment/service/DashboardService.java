package com.teacher.managerment.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teacher.managerment.dto.*;
import com.teacher.managerment.entity.CourseClass;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private WorkScheduleRepository workScheduleRepository;
    @Autowired
    private CourseClassRepository courseClassRepository;
    @Autowired
    private CourseRepository courseRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired
    private UserRepository userRepository;

    public DashboardStatsDto getDashboardStats(User user) {
        Long userId = user.getId();
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));

        // Get basic stats
        Long todayClasses = workScheduleRepository.countTodayClassesByTeacherId(userId, today);
        Long totalStudents = getTotalStudentsByTeacherId(userId);
        Long totalSubjects = courseRepository.countByTeacherId(userId);
        Long weeklyTeachingHours = workScheduleRepository.getTotalTeachingHoursByTeacherId(userId, startOfWeek, endOfWeek);

        // Handle null values
        todayClasses = todayClasses != null ? todayClasses : 0L;
        totalStudents = totalStudents != null ? totalStudents : 0L;
        totalSubjects = totalSubjects != null ? totalSubjects : 0L;
        weeklyTeachingHours = weeklyTeachingHours != null ? weeklyTeachingHours : 0L;

        DashboardStatsDto stats = new DashboardStatsDto(todayClasses, totalStudents, totalSubjects, weeklyTeachingHours);

        // Get today's schedule
        List<TodayScheduleDto> todaySchedule = workScheduleRepository.findByTeacherIdAndDate(userId, today)
                .stream()
                .map(TodayScheduleDto::new)
                .collect(Collectors.toList());
        stats.setTodaySchedule(todaySchedule);

        // Get recent activities
        Pageable activityPageable = PageRequest.of(0, 5);
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        List<ActivityDto> recentActivities = activityRepository.findRecentActivitiesByUserId(userId, oneWeekAgo, activityPageable)
                .stream()
                .map(ActivityDto::new)
                .collect(Collectors.toList());
        stats.setRecentActivities(recentActivities);

        // Get important notifications
        Pageable notificationPageable = PageRequest.of(0, 3);
        List<NotificationDto> importantNotifications = notificationRepository.findImportantByUserId(userId, notificationPageable)
                .stream()
                .map(NotificationDto::new)
                .collect(Collectors.toList());
        stats.setImportantNotifications(importantNotifications);

        // Get weekly progress
        DashboardStatsDto.WeeklyProgressDto weeklyProgress = getWeeklyProgress(userId, startOfWeek, endOfWeek);
        stats.setWeeklyProgress(weeklyProgress);

        return stats;
    }
    private DashboardStatsDto.WeeklyProgressDto getWeeklyProgress(Long userId, LocalDate startOfWeek, LocalDate endOfWeek) {
        Long totalClasses = workScheduleRepository.countWeeklyClassesByTeacherId(userId, startOfWeek, endOfWeek);
        Long completedClasses = totalClasses != null ? Math.round(totalClasses * 0.75) : 0L; // 75% completed as example

        // Mock data for tests and attendance - in real app, you'd have separate entities
        Long totalTests = 50L;
        Long gradedTests = 45L;
        Long totalAttendance = completedClasses;
        Long completedAttendance = completedClasses != null ? Math.round(completedClasses * 0.89) : 0L; // 89% as example

        totalClasses = totalClasses != null ? totalClasses : 0L;

        return new DashboardStatsDto.WeeklyProgressDto(
                completedClasses, totalClasses, gradedTests, totalTests, completedAttendance, totalAttendance
        );
    }

    public Long getTotalStudentsByTeacherId(Long teacherId) {
        List<CourseClass> classes = courseClassRepository.findByTeacherIdAndActiveTrue(teacherId);
        long totalStudents = 0;

        for (CourseClass courseClass : classes) {
            if (courseClass.getStudentList() != null && !courseClass.getStudentList().trim().isEmpty()) {
                try {
                    // Try to parse as JSON array first
                    List<Object> students = objectMapper.readValue(courseClass.getStudentList(), new TypeReference<List<Object>>() {});
                    totalStudents += students.size();
                } catch (Exception e) {
                    // If JSON parsing fails, try to count by splitting with common delimiters
                    String studentList = courseClass.getStudentList().trim();
                    if (!studentList.isEmpty()) {
                        // Try splitting by common delimiters: comma, semicolon, newline
                        String[] students = studentList.split("[,;\n\r]+");
                        // Filter out empty strings
                        long count = java.util.Arrays.stream(students)
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .count();
                        totalStudents += count;
                    }
                }
            }
        }

        return totalStudents;
    }
}
