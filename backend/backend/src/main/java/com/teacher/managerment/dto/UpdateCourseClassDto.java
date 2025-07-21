package com.teacher.managerment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateCourseClassDto {
    @NotBlank(message = "Tên lớp học không được để trống")
    @Size(max = 100, message = "Tên lớp học không được vượt quá 100 ký tự")
    private String className;

    private String schedule;
    private String studentList;

    // Constructors
    public UpdateCourseClassDto() {}

    public UpdateCourseClassDto(String className, String schedule, String studentList) {
        this.className = className;
        this.schedule = schedule;
        this.studentList = studentList;
    }

    // Getters and Setters
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