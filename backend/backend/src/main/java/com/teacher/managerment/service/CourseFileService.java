package com.teacher.managerment.service;

import com.teacher.managerment.dto.CourseFileDto;
import com.teacher.managerment.entity.Course;
import com.teacher.managerment.entity.CourseFile;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.repository.CourseFileRepository;
import com.teacher.managerment.repository.CourseRepository;
import com.teacher.managerment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseFileService {

    @Autowired
    private CourseFileRepository courseFileRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public CourseFileDto uploadFile(MultipartFile file, Long courseId, String fileCategory, Long userId) {
        try {
            // Validate course exists
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học"));

            if (!course.getActive()) {
                throw new RuntimeException("Môn học đã bị vô hiệu hóa");
            }

            // Validate user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Validate file category
            CourseFile.FileCategory category;
            try {
                category = CourseFile.FileCategory.valueOf(fileCategory);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Loại file không hợp lệ");
            }

            // Store file
            String filePath = fileStorageService.storeFile(file, fileCategory.toLowerCase(), courseId);

            // Create course file entity
            CourseFile courseFile = new CourseFile(
                    course,
                    extractFileName(filePath),
                    file.getOriginalFilename(),
                    filePath,
                    file.getContentType(),
                    file.getSize(),
                    category,
                    user
            );

            CourseFile savedFile = courseFileRepository.save(courseFile);
            return new CourseFileDto(savedFile);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi upload file: " + e.getMessage(), e);
        }
    }

    public List<CourseFileDto> getCourseFiles(Long courseId) {
        List<CourseFile> files = courseFileRepository.findByCourseIdAndActiveTrue(courseId);
        return files.stream().map(CourseFileDto::new).collect(Collectors.toList());
    }

    public List<CourseFileDto> getCourseFilesByCategory(Long courseId, String categoryStr) {
        try {
            CourseFile.FileCategory category = CourseFile.FileCategory.valueOf(categoryStr);
            List<CourseFile> files = courseFileRepository.findByCourseIdAndFileCategoryAndActiveTrue(courseId, category);
            return files.stream().map(CourseFileDto::new).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Loại file không hợp lệ");
        }
    }

    public CourseFileDto getFileById(Long fileId) {
        CourseFile file = courseFileRepository.findByIdAndActiveTrue(fileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy file"));
        return new CourseFileDto(file);
    }

    public void deleteFile(Long fileId, Long userId) {
        try {
            CourseFile file = courseFileRepository.findByIdAndActiveTrue(fileId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy file"));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Check permissions - only admin or file uploader can delete
            if (!user.getRole().equals(User.Role.ADMIN) && !file.getUploadedBy().getId().equals(userId)) {
                throw new RuntimeException("Bạn không có quyền xóa file này");
            }

            // Soft delete
            file.setActive(false);
            courseFileRepository.save(file);

            // Optionally delete physical file
            try {
                fileStorageService.deleteFile(file.getFilePath());
            } catch (Exception e) {
                // Log error but don't fail the operation
                System.err.println("Failed to delete physical file: " + e.getMessage());
            }

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa file: " + e.getMessage(), e);
        }
    }

    public Long getFileCountByCourse(Long courseId) {
        return courseFileRepository.countByCourseIdAndActiveTrue(courseId);
    }

    public Long getFileCountByCourseAndCategory(Long courseId, CourseFile.FileCategory category) {
        return courseFileRepository.countByCourseIdAndFileCategoryAndActiveTrue(courseId, category);
    }

    private String extractFileName(String filePath) {
        return filePath.substring(filePath.lastIndexOf('/') + 1);
    }
}
