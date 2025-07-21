package com.teacher.managerment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateCourseDto {
    @NotBlank(message = "Tên môn học không được để trống")
    @Size(max = 200, message = "Tên môn học không được vượt quá 200 ký tự")
    private String courseName;

    private String description;
    private String teachingMaterials;
    private String referenceMaterials;

    // Constructors
    public UpdateCourseDto() {}

    public UpdateCourseDto(String courseName, String description,
                           String teachingMaterials, String referenceMaterials) {
        this.courseName = courseName;
        this.description = description;
        this.teachingMaterials = teachingMaterials;
        this.referenceMaterials = referenceMaterials;
    }

    // Getters and Setters
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