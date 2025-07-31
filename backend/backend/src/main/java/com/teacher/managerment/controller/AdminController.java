package com.teacher.managerment.controller;

import com.teacher.managerment.dto.AdminStatsDto;
import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.service.UserService;
import com.teacher.managerment.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000")
//@CrossOrigin(origins = "https://teacher-management-project-4r41.vercel.app")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private LeaveRequestService leaveRequestService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getAdminStats() {
        try {
            System.out.println("🟢 Đã vào block try trong AdminStats API");
            AdminStatsDto stats = new AdminStatsDto();

            // User stats
            stats.setTotalUsers(userService.getTotalUsersCount());
            stats.setTotalTeachers(userService.getTeachersCount());
            stats.setTotalAdmins(userService.getAdminsCount());
            stats.setActiveUsers(userService.getActiveUsersCount());

            // Leave request stats
            stats.setTotalLeaveRequests(leaveRequestService.getTotalRequestsCount());
            stats.setPendingLeaveRequests(leaveRequestService.countPendingRequests());
            stats.setApprovedLeaveRequests(leaveRequestService.getApprovedLeaveRequests());
            stats.setRejectedLeaveRequests(leaveRequestService.getRejectedLeaveRequests());

            System.out.println("📊 Tổng admin: " + stats.getTotalAdmins());
            System.out.println("📊 Tổng user đang hoạt động: " + stats.getActiveUsers());
            System.out.println("📊 Tổng user: " + stats.getTotalUsers());
            System.out.println("📊 Tổng giáo viên: " + stats.getTotalTeachers());
            System.out.println("📊 Tổng pending leave requests: " + stats.getPendingLeaveRequests());
            System.out.println("📊 Tổng approved leave requests: " + stats.getApprovedLeaveRequests());
            System.out.println("📊 Tổng leave requests: " + stats.getTotalLeaveRequests());
            System.out.println("📊 Tổng rejected leave requests: " + stats.getRejectedLeaveRequests());

            return ResponseEntity.ok(ApiResponse.success("Admin statistics retrieved successfully",stats));
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi lấy admin stats: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to retrieve admin statistics"));
        }
    }
}