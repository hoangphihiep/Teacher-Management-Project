package com.teacher.managerment.controller;

import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.dto.DashboardStatsDto;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
//@CrossOrigin(origins = "http://localhost:3000")
@CrossOrigin(origins = "https://teacher-management-project-gamma.vercel.app")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            DashboardStatsDto stats = dashboardService.getDashboardStats(currentUser);

            return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard stats retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error retrieving dashboard stats: " + e.getMessage(), null));
        }
    }
}
