package com.teacher.managerment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificationDto {
    private Long id;
    private String name;
    private String issuer;
    private String issueYear;
    private String expiryYear;
    private String credentialId;
    private String description;
}
