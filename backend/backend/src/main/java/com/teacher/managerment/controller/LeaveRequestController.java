package com.teacher.managerment.controller;

import com.teacher.managerment.dto.TeacherProfileDto;
import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.dto.CreateLeaveRequestDto;
import com.teacher.managerment.dto.LeaveRequestDto;
import com.teacher.managerment.entity.LeaveRequest;
import com.teacher.managerment.security.JwtUtils;
import com.teacher.managerment.service.AuthService;
import com.teacher.managerment.service.LeaveRequestService;
import com.teacher.managerment.service.TeacherProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leave-requests")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @Autowired
    private TeacherProfileService profileService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> createLeaveRequest(
            @Valid @RequestBody CreateLeaveRequestDto createDto,
            HttpServletRequest request) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            System.out.println ("userId: " + userId);
            System.out.println (createDto.getReason() + createDto.getLeaveType() + createDto.getEndDate() + createDto.getStartDate());
            LeaveRequestDto leaveRequest = leaveRequestService.createLeaveRequest(userId, createDto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đơn nghỉ phép đã được tạo thành công", leaveRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getMyLeaveRequests(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            if (size > 0) {
                Pageable pageable = PageRequest.of(page, size);
                Page<LeaveRequestDto> requests = leaveRequestService.getTeacherLeaveRequests(userId, pageable);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn nghỉ phép thành công", requests.getContent()));
            } else {
                List<LeaveRequestDto> requests = leaveRequestService.getTeacherLeaveRequests(userId);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đơn nghỉ phép thành công", requests));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> approveLeaveRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long adminId = profile.getUserId();
            String adminNotes = body != null ? body.get("adminNotes") : null;
            LeaveRequestDto leaveRequest = leaveRequestService.approveLeaveRequest(requestId, adminId, adminNotes);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đơn nghỉ phép đã được phê duyệt", leaveRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> rejectLeaveRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long adminId = profile.getUserId();
            String adminNotes = body != null ? body.get("adminNotes") : null;
            LeaveRequestDto leaveRequest = leaveRequestService.rejectLeaveRequest(requestId, adminId, adminNotes);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đơn nghỉ phép đã bị từ chối", leaveRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/{requestId}/cancel")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> cancelLeaveRequest(
            @PathVariable Long requestId,
            HttpServletRequest request) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            LeaveRequestDto leaveRequest = leaveRequestService.cancelLeaveRequest(requestId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đơn nghỉ phép đã được hủy", leaveRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> getLeaveRequestById(@PathVariable Long requestId) {
        try {
            LeaveRequestDto leaveRequest = leaveRequestService.getLeaveRequestById(requestId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin đơn nghỉ phép thành công", leaveRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/leave-types")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getLeaveTypes() {
        List<Map<String, String>> leaveTypes = Arrays.stream(LeaveRequest.LeaveType.values())
                .map(type -> Map.of(
                        "value", type.name(),
                        "label", type.getDisplayName()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách loại nghỉ phép thành công", leaveTypes));
    }

    @GetMapping("/stats/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getPendingRequestsCount() {
        try {
            Long count = leaveRequestService.countPendingRequests();
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy số lượng đơn chờ phê duyệt thành công", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    private String getUserNameFromRequest(HttpServletRequest request) {
        String token = jwtUtils.getJwtFromCookies(request);
        System.out.println ("token: " + token);
        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                System.out.println ("token1: " + token);
            }
        }

        if (token != null && jwtUtils.validateJwtToken(token)) {
            System.out.println ("userId: " + jwtUtils.getUserIdFromJwtToken(token));
            return jwtUtils.getUserNameFromJwtToken(token);
        }

        throw new RuntimeException("Token không hợp lệ");
    }
}
