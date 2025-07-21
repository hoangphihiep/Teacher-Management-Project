package com.teacher.managerment.controller;

import com.teacher.managerment.dto.*;
import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.service.CourseService;
import com.teacher.managerment.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin/courses")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminCourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // Course management endpoints
    @PostMapping
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(
            @Valid @RequestBody CreateCourseDto createCourseDto,
            Authentication authentication) {
        try {
            Long adminId = userService.getCurrentUserId(authentication);
            CourseDto course = courseService.createCourse(createCourseDto, adminId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo môn học thành công", course));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDto>>> getAllCourses() {
        try {
            List<CourseDto> courses = courseService.getAllCourses();
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách môn học thành công", courses));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourseById(@PathVariable Long courseId) {
        try {
            CourseDto course = courseService.getCourseById(courseId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học"));
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin môn học thành công", course));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody UpdateCourseDto updateCourseDto) {
        try {
            CourseDto course = courseService.updateCourse(courseId, updateCourseDto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật môn học thành công", course));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long courseId) {
        try {
            courseService.deleteCourse(courseId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa môn học thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Course assignment endpoints
    @PostMapping("/{courseId}/assignments")
    public ResponseEntity<ApiResponse<CourseAssignmentDto>> assignTeacherToCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateCourseAssignmentDto assignmentDto,
            Authentication authentication) {
        try {
            Long adminId = userService.getCurrentUserId(authentication);
            assignmentDto.setCourseId(courseId); // Ensure courseId matches path parameter
            CourseAssignmentDto assignment = courseService.assignTeacherToCourse(assignmentDto, adminId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Phân công giáo viên thành công", assignment));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{courseId}/assignments")
    public ResponseEntity<ApiResponse<List<CourseAssignmentDto>>> getCourseAssignments(@PathVariable Long courseId) {
        try {
            List<CourseAssignmentDto> assignments = courseService.getCourseAssignments(courseId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phân công thành công", assignments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<Void>> removeTeacherFromCourse(@PathVariable Long assignmentId) {
        try {
            courseService.removeTeacherFromCourse(assignmentId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Hủy phân công giáo viên thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Course class endpoints
    @PostMapping("/{courseId}/classes")
    public ResponseEntity<ApiResponse<CourseClassDto>> createCourseClass(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateCourseClassDto createClassDto,
            Authentication authentication) {
        try {
            System.out.println ("Có vào đây");
            Long adminId = userService.getCurrentUserId(authentication);
            createClassDto.setCourseId(courseId); // Ensure courseId matches path parameter
            System.out.println("Thông tin 1: " + createClassDto.getClassName());
            System.out.println("Thông tin 3: " + createClassDto.getClassName());
            System.out.println("Thông tin 4: " + createClassDto.getCourseId());
            System.out.println("Thông tin 5: " + createClassDto.getSchedule());
            CourseClassDto courseClass = courseService.createCourseClass(createClassDto, adminId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo lớp học thành công", courseClass));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{courseId}/classes")
    public ResponseEntity<ApiResponse<List<CourseClassDto>>> getCourseClasses(@PathVariable Long courseId) {
        try {
            List<CourseClassDto> classes = courseService.getCourseClasses(courseId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách lớp học thành công", classes));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/classes/{classId}")
    public ResponseEntity<ApiResponse<CourseClassDto>> getCourseClassById(@PathVariable Long classId) {
        try {
            CourseClassDto courseClass = courseService.getCourseClassById(classId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin lớp học thành công", courseClass));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/classes/{classId}")
    public ResponseEntity<ApiResponse<CourseClassDto>> updateCourseClass(
            @PathVariable Long classId,
            @Valid @RequestBody UpdateCourseClassDto updateClassDto) {
        try {
            CourseClassDto courseClass = courseService.updateCourseClass(classId, updateClassDto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật lớp học thành công", courseClass));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/classes/{classId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourseClass(@PathVariable Long classId) {
        try {
            courseService.deleteCourseClass(classId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa lớp học thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Get all teachers for assignment dropdown
    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllTeachers() {
        try {
            List<UserDto> teachers = userService.getAllTeachers();
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách giáo viên thành công", teachers));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
