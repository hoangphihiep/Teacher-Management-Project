package com.teacher.managerment.repository;

import com.teacher.managerment.entity.Certification;
import com.teacher.managerment.entity.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByProfileOrderByIssueYearDesc(TeacherProfile profile);
    List<Certification> findByProfileId(Long profileId);

    void deleteByProfile(TeacherProfile profile);
}
