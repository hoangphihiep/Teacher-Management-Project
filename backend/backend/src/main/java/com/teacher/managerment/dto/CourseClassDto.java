package com.teacher.managerment.dto;

import com.teacher.managerment.entity.CourseClass;
import java.time.LocalDateTime;

public class CourseClassDto {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long teacherId;
    private String teacherName;
    private String className;
    private String schedule;
    private String studentList;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
    private Long createdById;

    // Constructors
    public CourseClassDto() {}

    public CourseClassDto(CourseClass courseClass) {
        this.id = courseClass.getId();
        this.className = courseClass.getClassName();
        this.schedule = courseClass.getSchedule();
        this.studentList = courseClass.getStudentList();
        this.active = courseClass.getActive();
        this.createdAt = courseClass.getCreatedAt();
        this.updatedAt = courseClass.getUpdatedAt();

        if (courseClass.getCourse() != null) {
            this.courseId = courseClass.getCourse().getId();
            this.courseCode = courseClass.getCourse().getCourseCode();
            this.courseName = courseClass.getCourse().getCourseName();
        }

        if (courseClass.getTeacher() != null) {
            this.teacherId = courseClass.getTeacher().getId();
            this.teacherName = courseClass.getTeacher().getFullName();
        }

        if (courseClass.getCreatedBy() != null) {
            this.createdByName = courseClass.getCreatedBy().getFullName();
            this.createdById = courseClass.getCreatedBy().getId();
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

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public String getStudentList() {
        return studentList;
    }

    public void setStudentList(String studentList) {
        this.studentList = studentList;
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
}