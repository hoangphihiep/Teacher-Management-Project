package com.teacher.managerment.repository;

import com.teacher.managerment.entity.Education;
import com.teacher.managerment.entity.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByProfileOrderByEndYearDesc(TeacherProfile profile);
    List<Education> findByProfileId(Long profileId);
    void deleteByProfile(TeacherProfile profile);
}

