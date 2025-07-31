package com.teacher.managerment.controller;

import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.dto.LeaveRequestDto;
import com.teacher.managerment.security.JwtUtils;
import com.teacher.managerment.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/leave-requests")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminLeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getAllLeaveRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size > 0) {
                Pageable pageable = PageRequest.of(page, size);
                Page<LeaveRequestDto> requests = leaveRequestService.getAllLeaveRequests(pageable);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn nghỉ phép thành công", requests.getContent()));
            } else {
                List<LeaveRequestDto> requests = leaveRequestService.getAllLeaveRequests();
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn nghỉ phép thành công", requests));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getPendingLeaveRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size > 0) {
                Pageable pageable = PageRequest.of(page, size);
                Page<LeaveRequestDto> requests = leaveRequestService.getPendingLeaveRequests(pageable);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn chờ phê duyệt thành công", requests.getContent()));
            } else {
                List<LeaveRequestDto> requests = leaveRequestService.getPendingLeaveRequests();
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn chờ phê duyệt thành công", requests));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> approveLeaveRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request) {
        try {
            System.out.println("🔍 Approve request - RequestId: " + requestId);
            System.out.println("🔍 Approve request - Body: " + body);

            // Validate requestId first
            if (requestId == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Request ID không được để trống", null));
            }

            Long adminId = getUserIdFromRequest(request);
            System.out.println("🔍 Approve request - AdminId: " + adminId);

            String adminNotes = body != null ? body.get("adminNotes") : null;
            System.out.println("🔍 Approve request - AdminNotes: " + adminNotes);

            LeaveRequestDto leaveRequest = leaveRequestService.approveLeaveRequest(requestId, adminId, adminNotes);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đơn nghỉ phép đã được phê duyệt", leaveRequest));
        } catch (Exception e) {
            System.out.println("❌ Error in approve request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> rejectLeaveRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request) {
        try {
            System.out.println("🔍 Reject request - RequestId: " + requestId);
            System.out.println("🔍 Reject request - Body: " + body);

            // Validate requestId first
            if (requestId == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Request ID không được để trống", null));
            }

            Long adminId = getUserIdFromRequest(request);
            System.out.println("🔍 Reject request - AdminId: " + adminId);

            String adminNotes = body != null ? body.get("adminNotes") : null;
            System.out.println("🔍 Reject request - AdminNotes: " + adminNotes);

            LeaveRequestDto leaveRequest = leaveRequestService.rejectLeaveRequest(requestId, adminId, adminNotes);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đơn nghỉ phép đã bị từ chối", leaveRequest));
        } catch (Exception e) {
            System.out.println("❌ Error in reject request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> getLeaveRequestById(@PathVariable Long requestId) {
        try {
            LeaveRequestDto leaveRequest = leaveRequestService.getLeaveRequestById(requestId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin đơn nghỉ phép thành công", leaveRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getLeaveRequestStats() {
        try {
            Map<String, Long> stats = Map.of(
                    "pendingRequests", leaveRequestService.countPendingRequests(),
                    "activeLeaves", leaveRequestService.countActiveLeaves(),
                    "totalRequests", leaveRequestService.getTotalRequestsCount()
            );
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thống kê đơn nghỉ phép thành công", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = jwtUtils.getJwtFromCookies(request);
        System.out.println("🔍 Token from cookies: " + (token != null ? "Found" : "Not found"));

        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            System.out.println("🔍 Authorization header: " + (authHeader != null ? "Found" : "Not found"));
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                System.out.println("🔍 Token from header: " + (token != null ? "Found" : "Not found"));
            }
        }

        if (token != null && jwtUtils.validateJwtToken(token)) {
            Long userId = jwtUtils.getUserIdFromJwtToken(token);
            System.out.println("🔍 User ID from token: " + userId);
            return userId;
        }

        throw new RuntimeException("Token không hợp lệ hoặc không tìm thấy");
    }
}
