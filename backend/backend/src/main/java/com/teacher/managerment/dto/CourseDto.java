package com.teacher.managerment.dto;

import com.teacher.managerment.entity.Course;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CourseDto {
    private Long id;
    private String courseCode;
    private String courseName;
    private String description;
    private String teachingMaterials;
    private String referenceMaterials;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
    private Long createdById;
    private List<CourseAssignmentDto> assignments;
    private List<CourseClassDto> classes;
    private Integer assignmentCount;
    private Integer classCount;
    private List<CourseFileDto> courseFiles;
    private List<CourseFileDto> teachingMaterialFiles;
    private List<CourseFileDto> referenceMaterialFiles;
    private Integer totalFilesCount;

    // Constructors
    public CourseDto() {}

    public CourseDto(Course course) {
        this.id = course.getId();
        this.courseCode = course.getCourseCode();
        this.courseName = course.getCourseName();
        this.description = course.getDescription();
        this.teachingMaterials = course.getTeachingMaterials();
        this.referenceMaterials = course.getReferenceMaterials();
        this.active = course.getActive();
        this.createdAt = course.getCreatedAt();
        this.updatedAt = course.getUpdatedAt();

        if (course.getCreatedBy() != null) {
            this.createdByName = course.getCreatedBy().getFullName();
            this.createdById = course.getCreatedBy().getId();
        }

        if (course.getAssignments() != null) {
            this.assignments = course.getAssignments().stream()
                    .filter(assignment -> assignment.getActive())
                    .map(CourseAssignmentDto::new)
                    .collect(Collectors.toList());
            this.assignmentCount = this.assignments.size();
        }

        if (course.getClasses() != null) {
            this.classes = course.getClasses().stream()
                    .filter(courseClass -> courseClass.getActive())
                    .map(CourseClassDto::new)
                    .collect(Collectors.toList());
            this.classCount = this.classes.size();
        }

        if (course.getCourseFiles() != null) {
            this.courseFiles = course.getCourseFiles().stream()
                    .filter(file -> file.getActive())
                    .map(CourseFileDto::new)
                    .collect(Collectors.toList());

            this.teachingMaterialFiles = this.courseFiles.stream()
                    .filter(file -> "TEACHING_MATERIAL".equals(file.getFileCategory()))
                    .collect(Collectors.toList());

            this.referenceMaterialFiles = this.courseFiles.stream()
                    .filter(file -> "REFERENCE_MATERIAL".equals(file.getFileCategory()))
                    .collect(Collectors.toList());

            this.totalFilesCount = this.courseFiles.size();
        } else {
            this.courseFiles = new ArrayList<>();
            this.teachingMaterialFiles = new ArrayList<>();
            this.referenceMaterialFiles = new ArrayList<>();
            this.totalFilesCount = 0;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTeachingMaterials() {
        return teachingMaterials;
    }

    public void setTeachingMaterials(String teachingMaterials) {
        this.teachingMaterials = teachingMaterials;
    }

    public String getReferenceMaterials() {
        return referenceMaterials;
    }

    public void setReferenceMaterials(String referenceMaterials) {
        this.referenceMaterials = referenceMaterials;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public List<CourseAssignmentDto> getAssignments() {
        return assignments;
    }

    public void setAssignments(List<CourseAssignmentDto> assignments) {
        this.assignments = assignments;
    }

    public List<CourseClassDto> getClasses() {
        return classes;
    }

    public void setClasses(List<CourseClassDto> classes) {
        this.classes = classes;
    }

    public Integer getAssignmentCount() {
        return assignmentCount;
    }

    public void setAssignmentCount(Integer assignmentCount) {
        this.assignmentCount = assignmentCount;
    }

    public Integer getClassCount() {
        return classCount;
    }

    public void setClassCount(Integer classCount) {
        this.classCount = classCount;
    }
    public List<CourseFileDto> getCourseFiles() {
        return courseFiles;
    }

    public void setCourseFiles(List<CourseFileDto> courseFiles) {
        this.courseFiles = courseFiles;
    }

    public List<CourseFileDto> getTeachingMaterialFiles() {
        return teachingMaterialFiles;
    }

    public void setTeachingMaterialFiles(List<CourseFileDto> teachingMaterialFiles) {
        this.teachingMaterialFiles = teachingMaterialFiles;
    }

    public List<CourseFileDto> getReferenceMaterialFiles() {
        return referenceMaterialFiles;
    }

    public void setReferenceMaterialFiles(List<CourseFileDto> referenceMaterialFiles) {
        this.referenceMaterialFiles = referenceMaterialFiles;
    }

    public Integer getTotalFilesCount() {
        return totalFilesCount;
    }

    public void setTotalFilesCount(Integer totalFilesCount) {
        this.totalFilesCount = totalFilesCount;
    }
}