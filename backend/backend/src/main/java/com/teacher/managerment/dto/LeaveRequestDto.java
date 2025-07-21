package com.teacher.managerment.dto;

import com.teacher.managerment.entity.LeaveRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private String teacherEmail;
    private LeaveRequest.LeaveType leaveType;
    private String leaveTypeDisplay;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private LeaveRequest.LeaveStatus status;
    private String statusDisplay;
    private Long approvedById;
    private String approvedByName;
    private String adminNotes;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer totalDays;

    public LeaveRequestDto(LeaveRequest leaveRequest) {
        this.id = leaveRequest.getId();
        this.teacherId = leaveRequest.getTeacher().getId();
        this.teacherName = leaveRequest.getTeacher().getFullName();
        this.teacherEmail = leaveRequest.getTeacher().getEmail();
        this.leaveType = leaveRequest.getLeaveType();
        this.leaveTypeDisplay = leaveRequest.getLeaveType().getDisplayName();
        this.startDate = leaveRequest.getStartDate();
        this.endDate = leaveRequest.getEndDate();
        this.reason = leaveRequest.getReason();
        this.status = leaveRequest.getStatus();
        this.statusDisplay = leaveRequest.getStatus().getDisplayName();
        if (leaveRequest.getApprovedBy() != null) {
            this.approvedById = leaveRequest.getApprovedBy().getId();
            this.approvedByName = leaveRequest.getApprovedBy().getFullName();
        }
        this.adminNotes = leaveRequest.getAdminNotes();
        this.createdAt = leaveRequest.getCreatedAt();
        this.updatedAt = leaveRequest.getUpdatedAt();
        this.approvedAt = leaveRequest.getApprovedAt();
        this.totalDays = calculateTotalDays(leaveRequest.getStartDate(), leaveRequest.getEndDate());
    }

    private int calculateTotalDays(LocalDate startDate, LocalDate endDate) {
        return (int) (endDate.toEpochDay() - startDate.toEpochDay() + 1);
    }
}
