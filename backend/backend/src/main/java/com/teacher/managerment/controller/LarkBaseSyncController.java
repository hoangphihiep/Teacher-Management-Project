package com.teacher.managerment.controller;

import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.service.LarkBaseService;
import com.teacher.managerment.service.LarkBaseSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/admin/larkbase")
@PreAuthorize("hasRole('ADMIN')")
public class LarkBaseSyncController {

    private static final Logger logger = LoggerFactory.getLogger(LarkBaseSyncController.class);

    @Autowired
    private LarkBaseSyncService larkBaseSyncService;

    @Autowired
    private LarkBaseService larkBaseService;

    // Test connection
    @GetMapping("/test-connection")
    public ResponseEntity<ApiResponse<Boolean>> testConnection() {
        try {
            boolean connected = larkBaseService.testConnection();
            return ResponseEntity.ok(new ApiResponse<>(true,
                    connected ? "Connection successful" : "Connection failed", connected));
        } catch (Exception e) {
            logger.error("Test connection failed", e);
            return ResponseEntity.ok(new ApiResponse<>(false,
                    "Connection test failed: " + e.getMessage(), false));
        }
    }

    // Đồng bộ tất cả users
    @PostMapping("/sync/users")
    public ResponseEntity<ApiResponse<String>> syncUsers() {
        try {
            CompletableFuture<Void> future = larkBaseSyncService.syncAllUsers();
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "User sync started successfully", "Sync in progress"));
        } catch (Exception e) {
            logger.error("Sync users failed", e);
            return ResponseEntity.ok(new ApiResponse<>(false,
                    "Failed to sync users: " + e.getMessage(), null));
        }
    }

    // Đồng bộ tất cả courses
    @PostMapping("/sync/courses")
    public ResponseEntity<ApiResponse<String>> syncCourses() {
        try {
            CompletableFuture<Void> future = larkBaseSyncService.syncAllCourses();
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Course sync started successfully", "Sync in progress"));
        } catch (Exception e) {
            logger.error("Sync courses failed", e);
            return ResponseEntity.ok(new ApiResponse<>(false,
                    "Failed to sync courses: " + e.getMessage(), null));
        }
    }

    // Đồng bộ tất cả work schedules
    @PostMapping("/sync/schedules")
    public ResponseEntity<ApiResponse<String>> syncSchedules() {
        try {
            CompletableFuture<Void> future = larkBaseSyncService.syncAllWorkSchedules();
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Schedule sync started successfully", "Sync in progress"));
        } catch (Exception e) {
            logger.error("Sync schedules failed", e);
            return ResponseEntity.ok(new ApiResponse<>(false,
                    "Failed to sync schedules: " + e.getMessage(), null));
        }
    }

    // Đồng bộ tất cả leave requests
    @PostMapping("/sync/leave-requests")
    public ResponseEntity<ApiResponse<String>> syncLeaveRequests() {
        try {
            CompletableFuture<Void> future = larkBaseSyncService.syncAllLeaveRequests();
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Leave request sync started successfully", "Sync in progress"));
        } catch (Exception e) {
            logger.error("Sync leave requests failed", e);
            return ResponseEntity.ok(new ApiResponse<>(false,
                    "Failed to sync leave requests: " + e.getMessage(), null));
        }
    }

    // Đồng bộ toàn bộ dữ liệu
    @PostMapping("/sync/all")
    public ResponseEntity<ApiResponse<String>> syncAll() {
        try {
            CompletableFuture<Void> future = larkBaseSyncService.syncAllData();
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Full sync started successfully", "Sync in progress"));
        } catch (Exception e) {
            logger.error("Sync all failed", e);
            return ResponseEntity.ok(new ApiResponse<>(false,
                    "Failed to sync all data: " + e.getMessage(), null));
        }
    }

    // Đồng bộ một user cụ thể
    @PostMapping("/sync/user/{userId}")
    public ResponseEntity<ApiResponse<String>> syncUser(@PathVariable Long userId) {
        try {
            larkBaseSyncService.syncUser(userId);
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "User synced successfully", "Success"));
        } catch (Exception e) {
            logger.error("Sync user failed", e);
            return ResponseEntity.ok(new ApiResponse<>(false,
                    "Failed to sync user: " + e.getMessage(), null));
        }
    }

    // Đồng bộ một course cụ thể
    @PostMapping("/sync/course/{courseId}")
    public ResponseEntity<ApiResponse<String>> syncCourse(@PathVariable Long courseId) {
        try {
            larkBaseSyncService.syncCourse(courseId);
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Course synced successfully", "Success"));
        } catch (Exception e) {
            logger.error("Sync course failed", e);
            return ResponseEntity.ok(new ApiResponse<>(false,
                    "Failed to sync course: " + e.getMessage(), null));
        }
    }
}
