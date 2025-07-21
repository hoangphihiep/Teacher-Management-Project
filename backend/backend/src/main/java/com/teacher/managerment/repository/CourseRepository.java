package com.teacher.managerment.repository;

import com.teacher.managerment.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByActiveTrue();

    Optional<Course> findByCourseCode(String courseCode);

    boolean existsByCourseCode(String courseCode);

    @Query("SELECT c FROM Course c JOIN c.assignments ca WHERE ca.teacher.id = :teacherId AND ca.active = true AND c.active = true")
    List<Course> findByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(c) FROM Course c WHERE c.active = true")
    Long countActiveCourses();

    @Query("SELECT c FROM Course c WHERE c.active = true ORDER BY c.createdAt DESC")
    List<Course> findAllActiveOrderByCreatedAtDesc();

    @Query("SELECT COUNT(c) FROM Course c JOIN c.assignments ca WHERE ca.teacher.id = :teacherId AND ca.active = true ")
    Long countByTeacherId(@Param("teacherId") Long teacherId);
}