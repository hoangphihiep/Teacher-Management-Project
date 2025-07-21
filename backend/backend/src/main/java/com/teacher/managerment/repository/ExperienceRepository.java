package com.teacher.managerment.repository;

import com.teacher.managerment.entity.Experience;
import com.teacher.managerment.entity.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByProfileOrderByIsCurrentDescStartPeriodDesc(TeacherProfile profile);
    List<Experience> findByProfileId(Long profileId);

    void deleteByProfile(TeacherProfile profile);
}