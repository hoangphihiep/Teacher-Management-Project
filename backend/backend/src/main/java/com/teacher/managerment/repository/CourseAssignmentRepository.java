package com.teacher.managerment.repository;

import com.teacher.managerment.entity.CourseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseAssignmentRepository extends JpaRepository<CourseAssignment, Long> {

    List<CourseAssignment> findByCourseIdAndActiveTrue(Long courseId);

    List<CourseAssignment> findByTeacherIdAndActiveTrue(Long teacherId);

    @Query("SELECT ca FROM CourseAssignment ca WHERE ca.course.id = :courseId AND ca.teacher.id = :teacherId AND ca.active = true")
    Optional<CourseAssignment> findByCourseIdAndTeacherIdAndActiveTrue(@Param("courseId") Long courseId, @Param("teacherId") Long teacherId);

    boolean existsByCourseIdAndTeacherIdAndActiveTrue(Long courseId, Long teacherId);

    @Query("SELECT COUNT(ca) FROM CourseAssignment ca WHERE ca.active = true")
    Long countActiveAssignments();
}
