package com.teacher.managerment.dto;

import com.teacher.managerment.entity.CourseFile;
import java.time.LocalDateTime;

public class CourseFileDto {
    private Long id;
    private Long courseId;
    private String fileName;
    private String originalFileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private String fileCategory; // TEACHING_MATERIAL or REFERENCE_MATERIAL
    private LocalDateTime uploadedAt;
    private String uploadedByName;
    private Long uploadedById;

    // Constructors
    public CourseFileDto() {}

    public CourseFileDto(CourseFile courseFile) {
        this.id = courseFile.getId();
        this.courseId = courseFile.getCourse().getId();
        this.fileName = courseFile.getFileName();
        this.originalFileName = courseFile.getOriginalFileName();
        this.filePath = courseFile.getFilePath();
        this.fileType = courseFile.getFileType();
        this.fileSize = courseFile.getFileSize();
        this.fileCategory = courseFile.getFileCategory().name();
        this.uploadedAt = courseFile.getUploadedAt();

        if (courseFile.getUploadedBy() != null) {
            this.uploadedByName = courseFile.getUploadedBy().getFullName();
            this.uploadedById = courseFile.getUploadedBy().getId();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileCategory() {
        return fileCategory;
    }

    public void setFileCategory(String fileCategory) {
        this.fileCategory = fileCategory;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(Long uploadedById) {
        this.uploadedById = uploadedById;
    }
}
