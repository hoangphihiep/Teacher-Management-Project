package com.teacher.managerment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "experiences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    private TeacherProfile profile;

    @Column(name = "position", nullable = false)
    private String position;

    @Column(name = "company", nullable = false)
    private String company;

    @Column(name = "start_period")
    private String startPeriod;

    @Column(name = "end_period")
    private String endPeriod;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_current")
    private Boolean isCurrent = false;
}

