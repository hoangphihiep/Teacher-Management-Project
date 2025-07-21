package com.teacher.managerment.repository;

import com.teacher.managerment.entity.CourseClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseClassRepository extends JpaRepository<CourseClass, Long> {

    List<CourseClass> findByCourseIdAndActiveTrue(Long courseId);

    List<CourseClass> findByTeacherIdAndActiveTrue(Long teacherId);

    @Query("SELECT cc FROM CourseClass cc WHERE cc.course.id = :courseId AND cc.teacher.id = :teacherId AND cc.active = true")
    List<CourseClass> findByCourseIdAndTeacherIdAndActiveTrue(@Param("courseId") Long courseId, @Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(cc) FROM CourseClass cc WHERE cc.active = true")
    Long countActiveClasses();

    @Query("SELECT cc FROM CourseClass cc WHERE cc.active = true ORDER BY cc.createdAt DESC")
    List<CourseClass> findAllActiveOrderByCreatedAtDesc();
}