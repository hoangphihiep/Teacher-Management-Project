package com.teacher.managerment.dto;

import java.util.List;

public class DashboardStatsDto {
    private Long todayClasses;
    private Long totalStudents;
    private Long totalSubjects;
    private Long weeklyTeachingHours;
    private List<TodayScheduleDto> todaySchedule;
    private List<ActivityDto> recentActivities;
    private List<NotificationDto> importantNotifications;
    private WeeklyProgressDto weeklyProgress;

    // Constructors
    public DashboardStatsDto() {}

    public DashboardStatsDto(Long todayClasses, Long totalStudents, Long totalSubjects, Long weeklyTeachingHours) {
        this.todayClasses = todayClasses;
        this.totalStudents = totalStudents;
        this.totalSubjects = totalSubjects;
        this.weeklyTeachingHours = weeklyTeachingHours;
    }

    // Getters and Setters
    public Long getTodayClasses() {
        return todayClasses;
    }

    public void setTodayClasses(Long todayClasses) {
        this.todayClasses = todayClasses;
    }

    public Long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Long getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(Long totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public Long getWeeklyTeachingHours() {
        return weeklyTeachingHours;
    }

    public void setWeeklyTeachingHours(Long weeklyTeachingHours) {
        this.weeklyTeachingHours = weeklyTeachingHours;
    }

    public List<TodayScheduleDto> getTodaySchedule() {
        return todaySchedule;
    }

    public void setTodaySchedule(List<TodayScheduleDto> todaySchedule) {
        this.todaySchedule = todaySchedule;
    }

    public List<ActivityDto> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<ActivityDto> recentActivities) {
        this.recentActivities = recentActivities;
    }

    public List<NotificationDto> getImportantNotifications() {
        return importantNotifications;
    }

    public void setImportantNotifications(List<NotificationDto> importantNotifications) {
        this.importantNotifications = importantNotifications;
    }

    public WeeklyProgressDto getWeeklyProgress() {
        return weeklyProgress;
    }

    public void setWeeklyProgress(WeeklyProgressDto weeklyProgress) {
        this.weeklyProgress = weeklyProgress;
    }

    public static class WeeklyProgressDto {
        private Long completedClasses;
        private Long totalClasses;
        private Long gradedTests;
        private Long totalTests;
        private Long completedAttendance;
        private Long totalAttendance;

        // Constructors
        public WeeklyProgressDto() {}

        public WeeklyProgressDto(Long completedClasses, Long totalClasses, Long gradedTests, Long totalTests, Long completedAttendance, Long totalAttendance) {
            this.completedClasses = completedClasses;
            this.totalClasses = totalClasses;
            this.gradedTests = gradedTests;
            this.totalTests = totalTests;
            this.completedAttendance = completedAttendance;
            this.totalAttendance = totalAttendance;
        }

        // Getters and Setters
        public Long getCompletedClasses() {
            return completedClasses;
        }

        public void setCompletedClasses(Long completedClasses) {
            this.completedClasses = completedClasses;
        }

        public Long getTotalClasses() {
            return totalClasses;
        }

        public void setTotalClasses(Long totalClasses) {
            this.totalClasses = totalClasses;
        }

        public Long getGradedTests() {
            return gradedTests;
        }

        public void setGradedTests(Long gradedTests) {
            this.gradedTests = gradedTests;
        }

        public Long getTotalTests() {
            return totalTests;
        }

        public void setTotalTests(Long totalTests) {
            this.totalTests = totalTests;
        }

        public Long getCompletedAttendance() {
            return completedAttendance;
        }

        public void setCompletedAttendance(Long completedAttendance) {
            this.completedAttendance = completedAttendance;
        }

        public Long getTotalAttendance() {
            return totalAttendance;
        }

        public void setTotalAttendance(Long totalAttendance) {
            this.totalAttendance = totalAttendance;
        }
    }
}
