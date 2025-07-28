package com.teacher.managerment.controller;

import com.teacher.managerment.dto.CourseFileDto;
import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.entity.CourseFile;
import com.teacher.managerment.service.CourseFileService;
import com.teacher.managerment.service.FileStorageService;
import com.teacher.managerment.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/course-files")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CourseFileController {

    @Autowired
    private CourseFileService courseFileService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserService userService;

    // Upload file for course
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<CourseFileDto>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId,
            @RequestParam("fileCategory") String fileCategory,
            Authentication authentication) {
        try {
            Long userId = userService.getCurrentUserId(authentication);
            CourseFileDto courseFile = courseFileService.uploadFile(file, courseId, fileCategory, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Upload file thành công", courseFile));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Get files for course
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<CourseFileDto>>> getCourseFiles(@PathVariable Long courseId) {
        try {
            List<CourseFileDto> files = courseFileService.getCourseFiles(courseId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách file thành công", files));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Get files by category
    @GetMapping("/course/{courseId}/category/{category}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<CourseFileDto>>> getCourseFilesByCategory(
            @PathVariable Long courseId,
            @PathVariable String category) {
        try {
            List<CourseFileDto> files = courseFileService.getCourseFilesByCategory(courseId, category);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách file thành công", files));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Download file
    @GetMapping("/download/{fileId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        try {
            CourseFileDto fileDto = courseFileService.getFileById(fileId);
            Path filePath = fileStorageService.getFilePath(fileDto.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = fileStorageService.getContentType(fileDto.getOriginalFileName());

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + fileDto.getOriginalFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // View file (for PDFs and other viewable files)
    @GetMapping("/view/{fileId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Resource> viewFile(@PathVariable Long fileId) {
        try {
            CourseFileDto fileDto = courseFileService.getFileById(fileId);
            Path filePath = fileStorageService.getFilePath(fileDto.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = fileStorageService.getContentType(fileDto.getOriginalFileName());

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + fileDto.getOriginalFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete file
    @DeleteMapping("/{fileId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable Long fileId,
            Authentication authentication) {
        try {
            Long userId = userService.getCurrentUserId(authentication);
            courseFileService.deleteFile(fileId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa file thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // Get file categories
    @GetMapping("/categories")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<String[]>> getFileCategories() {
        try {
            String[] categories = {"TEACHING_MATERIAL", "REFERENCE_MATERIAL"};
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách loại file thành công", categories));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
