package com.teacher.managerment.dto;

public class AdminStatsDto {
    private Long totalUsers;
    private Long totalTeachers;
    private Long totalAdmins;
    private Long activeUsers;
    private Long totalLeaveRequests;
    private Long pendingLeaveRequests;
    private Long approvedLeaveRequests;
    private Long rejectedLeaveRequests;

    // Constructors
    public AdminStatsDto() {}

    public AdminStatsDto(Long totalUsers, Long totalTeachers, Long totalAdmins, Long activeUsers,
                         Long totalLeaveRequests, Long pendingLeaveRequests,
                         Long approvedLeaveRequests, Long rejectedLeaveRequests) {
        this.totalUsers = totalUsers;
        this.totalTeachers = totalTeachers;
        this.totalAdmins = totalAdmins;
        this.activeUsers = activeUsers;
        this.totalLeaveRequests = totalLeaveRequests;
        this.pendingLeaveRequests = pendingLeaveRequests;
        this.approvedLeaveRequests = approvedLeaveRequests;
        this.rejectedLeaveRequests = rejectedLeaveRequests;
    }

    // Getters and Setters
    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalTeachers() {
        return totalTeachers;
    }

    public void setTotalTeachers(Long totalTeachers) {
        this.totalTeachers = totalTeachers;
    }

    public Long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(Long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public Long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public Long getTotalLeaveRequests() {
        return totalLeaveRequests;
    }

    public void setTotalLeaveRequests(Long totalLeaveRequests) {
        this.totalLeaveRequests = totalLeaveRequests;
    }

    public Long getPendingLeaveRequests() {
        return pendingLeaveRequests;
    }

    public void setPendingLeaveRequests(Long pendingLeaveRequests) {
        this.pendingLeaveRequests = pendingLeaveRequests;
    }

    public Long getApprovedLeaveRequests() {
        return approvedLeaveRequests;
    }

    public void setApprovedLeaveRequests(Long approvedLeaveRequests) {
        this.approvedLeaveRequests = approvedLeaveRequests;
    }

    public Long getRejectedLeaveRequests() {
        return rejectedLeaveRequests;
    }

    public void setRejectedLeaveRequests(Long rejectedLeaveRequests) {
        this.rejectedLeaveRequests = rejectedLeaveRequests;
    }
}
