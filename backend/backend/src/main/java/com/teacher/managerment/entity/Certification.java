package com.teacher.managerment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    private TeacherProfile profile;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "issuer", nullable = false)
    private String issuer;

    @Column(name = "issue_year")
    private String issueYear;

    @Column(name = "expiry_year")
    private String expiryYear;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}

