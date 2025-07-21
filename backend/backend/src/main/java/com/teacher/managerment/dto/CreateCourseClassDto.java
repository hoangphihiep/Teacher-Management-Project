package com.teacher.managerment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateCourseClassDto {
    @NotNull(message = "ID môn học không được để trống")
    private Long courseId;
    private Long teacherId; // Will be set automatically for teacher requests
    @NotBlank(message = "Tên lớp học không được để trống")
    @Size(max = 100, message = "Tên lớp học không được vượt quá 100 ký tự")
    private String className;
    private String schedule;
    private String studentList;
    // Constructors
    public CreateCourseClassDto() {}
    public CreateCourseClassDto(Long courseId, Long teacherId, String className,
                                String schedule, String studentList) {
        this.courseId = courseId;
        this.teacherId = teacherId;
        this.className = className;
        this.schedule = schedule;
        this.studentList = studentList;
    }

    // Getters and Setters
    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
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
}