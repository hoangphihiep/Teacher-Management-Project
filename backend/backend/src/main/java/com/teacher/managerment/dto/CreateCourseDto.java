package com.teacher.managerment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCourseDto {
    @NotBlank(message = "Mã môn học không được để trống")
    @Size(max = 20, message = "Mã môn học không được vượt quá 20 ký tự")
    private String courseCode;

    @NotBlank(message = "Tên môn học không được để trống")
    @Size(max = 200, message = "Tên môn học không được vượt quá 200 ký tự")
    private String courseName;

    private String description;
    private String teachingMaterials;
    private String referenceMaterials;

    // Constructors
    public CreateCourseDto() {}

    public CreateCourseDto(String courseCode, String courseName, String description,
                           String teachingMaterials, String referenceMaterials) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.description = description;
        this.teachingMaterials = teachingMaterials;
        this.referenceMaterials = referenceMaterials;
    }

    // Getters and Setters
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
}