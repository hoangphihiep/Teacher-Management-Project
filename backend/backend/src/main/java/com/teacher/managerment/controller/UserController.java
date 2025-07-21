package com.teacher.managerment.controller;

import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.dto.CreateUserDto;
import com.teacher.managerment.dto.UpdateUserDto;
import com.teacher.managerment.dto.UserDto;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size > 0) {
                Pageable pageable = PageRequest.of(page, size);
                Page<UserDto> users = userService.getAllUsers(pageable);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách người dùng thành công", users.getContent()));
            } else {
                List<UserDto> users = userService.getAllUsers();
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách người dùng thành công", users));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        try {
            UserDto user = userService.getUserById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin người dùng thành công", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserDto createDto) {
        try {
            UserDto user = userService.createUser(createDto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo người dùng thành công", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserDto updateDto) {
        try {
            UserDto user = userService.updateUser(id, updateDto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật người dùng thành công", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa người dùng thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable Long id) {
        try {
            UserDto user = userService.toggleUserStatus(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái người dùng thành công", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getUserRoles() {
        List<Map<String, String>> roles = Arrays.stream(User.Role.values())
                .map(role -> Map.of(
                        "value", role.name(),
                        "label", role.name().equals("TEACHER") ? "Giáo viên" : "Quản trị viên"
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách vai trò thành công", roles));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUserStats() {
        try {
            Map<String, Long> stats = Map.of(
                    "totalUsers", userService.getTotalUsersCount(),
                    "activeUsers", userService.getActiveUsersCount(),
                    "teachers", userService.getTeachersCount(),
                    "admins", userService.getAdminsCount()
            );
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thống kê người dùng thành công", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
