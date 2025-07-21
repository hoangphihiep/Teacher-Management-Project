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
@RequestMapping("/api/teacher/courses")
@PreAuthorize("hasRole('TEACHER')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TeacherCourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // Get courses assigned to current teacher
    @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getMyCourses(Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);
            List<CourseDto> courses = courseService.getCoursesByTeacherId(teacherId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách môn học được phân công thành công", courses));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Get course assignments for current teacher
    @GetMapping("/my-assignments")
    public ResponseEntity<ApiResponse<List<CourseAssignmentDto>>> getMyAssignments(Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);
            List<CourseAssignmentDto> assignments = courseService.getTeacherAssignments(teacherId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phân công thành công", assignments));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Get specific course details
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourseById(
            @PathVariable Long courseId,
            Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);

            // Verify teacher is assigned to this course
            List<CourseAssignmentDto> assignments = courseService.getTeacherAssignments(teacherId);
            boolean isAssigned = assignments.stream()
                    .anyMatch(assignment -> assignment.getCourseId().equals(courseId));

            if (!isAssigned) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Bạn không được phân công cho môn học này", null));
            }

            CourseDto course = courseService.getCourseById(courseId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học"));
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin môn học thành công", course));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Update course materials and description (teacher can only update these fields)
    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourseMaterials(
            @PathVariable Long courseId,
            @Valid @RequestBody UpdateCourseDto updateCourseDto,
            Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);

            // Verify teacher is assigned to this course
            List<CourseAssignmentDto> assignments = courseService.getTeacherAssignments(teacherId);
            boolean isAssigned = assignments.stream()
                    .anyMatch(assignment -> assignment.getCourseId().equals(courseId));

            if (!isAssigned) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Bạn không được phân công cho môn học này", null));
            }

            CourseDto course = courseService.updateCourse(courseId, updateCourseDto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thông tin môn học thành công", course));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Get classes for current teacher
    @GetMapping("/my-classes")
    public ResponseEntity<ApiResponse<List<CourseClassDto>>> getMyClasses(Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);
            List<CourseClassDto> classes = courseService.getTeacherClasses(teacherId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách lớp học thành công", classes));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Get classes for a specific course
    @GetMapping("/{courseId}/classes")
    public ResponseEntity<ApiResponse<List<CourseClassDto>>> getCourseClasses(
            @PathVariable Long courseId,
            Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);

            // Verify teacher is assigned to this course
            List<CourseAssignmentDto> assignments = courseService.getTeacherAssignments(teacherId);
            boolean isAssigned = assignments.stream()
                    .anyMatch(assignment -> assignment.getCourseId().equals(courseId));

            if (!isAssigned) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Bạn không được phân công cho môn học này", null));
            }

            List<CourseClassDto> classes = courseService.getCourseClassesByTeacher(courseId, teacherId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách lớp học thành công", classes));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Create new class for assigned course
    @PostMapping("/{courseId}/classes")
    public ResponseEntity<ApiResponse<CourseClassDto>> createCourseClass(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateCourseClassDto createClassDto,
            Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);

            // Verify teacher is assigned to this course
            List<CourseAssignmentDto> assignments = courseService.getTeacherAssignments(teacherId);
            boolean isAssigned = assignments.stream()
                    .anyMatch(assignment -> assignment.getCourseId().equals(courseId));

            if (!isAssigned) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Bạn không được phân công cho môn học này", null));
            }

            createClassDto.setCourseId(courseId);
            createClassDto.setTeacherId(teacherId);
            CourseClassDto courseClass = courseService.createCourseClass(createClassDto, teacherId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo lớp học thành công", courseClass));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Get specific class details
    @GetMapping("/classes/{classId}")
    public ResponseEntity<ApiResponse<CourseClassDto>> getCourseClassById(
            @PathVariable Long classId,
            Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);

            CourseClassDto courseClass = courseService.getCourseClassById(classId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

            // Verify teacher owns this class
            if (!courseClass.getTeacherId().equals(teacherId)) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Bạn không có quyền truy cập lớp học này", null));
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin lớp học thành công", courseClass));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Update class information
    @PutMapping("/classes/{classId}")
    public ResponseEntity<ApiResponse<CourseClassDto>> updateCourseClass(
            @PathVariable Long classId,
            @Valid @RequestBody UpdateCourseClassDto updateClassDto,
            Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);

            CourseClassDto existingClass = courseService.getCourseClassById(classId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

            // Verify teacher owns this class
            if (!existingClass.getTeacherId().equals(teacherId)) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Bạn không có quyền chỉnh sửa lớp học này", null));
            }

            CourseClassDto courseClass = courseService.updateCourseClass(classId, updateClassDto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật lớp học thành công", courseClass));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Delete class
    @DeleteMapping("/classes/{classId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourseClass(
            @PathVariable Long classId,
            Authentication authentication) {
        try {
            Long teacherId = userService.getCurrentUserId(authentication);

            CourseClassDto existingClass = courseService.getCourseClassById(classId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

            // Verify teacher owns this class
            if (!existingClass.getTeacherId().equals(teacherId)) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Bạn không có quyền xóa lớp học này", null));
            }

            courseService.deleteCourseClass(classId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa lớp học thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
