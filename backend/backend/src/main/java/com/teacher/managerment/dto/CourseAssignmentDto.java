package com.teacher.managerment.dto;

import com.teacher.managerment.entity.CourseAssignment;
import java.time.LocalDateTime;

public class CourseAssignmentDto {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long teacherId;
    private String teacherName;
    private String teacherEmail;
    private LocalDateTime assignedAt;
    private String assignedByName;
    private Long assignedById;
    private Boolean active;

    // Constructors
    public CourseAssignmentDto() {}

    public CourseAssignmentDto(CourseAssignment assignment) {
        this.id = assignment.getId();
        this.assignedAt = assignment.getAssignedAt();
        this.active = assignment.getActive();

        if (assignment.getCourse() != null) {
            this.courseId = assignment.getCourse().getId();
            this.courseCode = assignment.getCourse().getCourseCode();
            this.courseName = assignment.getCourse().getCourseName();
        }

        if (assignment.getTeacher() != null) {
            this.teacherId = assignment.getTeacher().getId();
            this.teacherName = assignment.getTeacher().getFullName();
            this.teacherEmail = assignment.getTeacher().getEmail();
        }

        if (assignment.getAssignedBy() != null) {
            this.assignedByName = assignment.getAssignedBy().getFullName();
            this.assignedById = assignment.getAssignedBy().getId();
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

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getTeacherEmail() {
        return teacherEmail;
    }

    public void setTeacherEmail(String teacherEmail) {
        this.teacherEmail = teacherEmail;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getAssignedByName() {
        return assignedByName;
    }

    public void setAssignedByName(String assignedByName) {
        this.assignedByName = assignedByName;
    }

    public Long getAssignedById() {
        return assignedById;
    }

    public void setAssignedById(Long assignedById) {
        this.assignedById = assignedById;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}