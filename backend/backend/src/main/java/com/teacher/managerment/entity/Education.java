package com.teacher.managerment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "educations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    private TeacherProfile profile;

    @Column(name = "degree", nullable = false)
    private String degree;

    @Column(name = "university", nullable = false)
    private String university;

    @Column(name = "start_year")
    private String startYear;

    @Column(name = "end_year")
    private String endYear;

    @Column(name = "gpa")
    private String gpa;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}

