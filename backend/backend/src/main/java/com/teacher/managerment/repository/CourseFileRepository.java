package com.teacher.managerment.repository;

import com.teacher.managerment.entity.CourseFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseFileRepository extends JpaRepository<CourseFile, Long> {

    List<CourseFile> findByCourseIdAndActiveTrue(Long courseId);

    List<CourseFile> findByCourseIdAndFileCategoryAndActiveTrue(Long courseId, CourseFile.FileCategory fileCategory);

    Optional<CourseFile> findByIdAndActiveTrue(Long id);

    @Query("SELECT cf FROM CourseFile cf WHERE cf.course.id = :courseId AND cf.fileCategory = :category AND cf.active = true ORDER BY cf.uploadedAt DESC")
    List<CourseFile> findByCourseAndCategoryOrderByUploadedAtDesc(@Param("courseId") Long courseId, @Param("category") CourseFile.FileCategory category);

    @Query("SELECT COUNT(cf) FROM CourseFile cf WHERE cf.course.id = :courseId AND cf.active = true")
    Long countByCourseIdAndActiveTrue(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(cf) FROM CourseFile cf WHERE cf.course.id = :courseId AND cf.fileCategory = :category AND cf.active = true")
    Long countByCourseIdAndFileCategoryAndActiveTrue(@Param("courseId") Long courseId, @Param("category") CourseFile.FileCategory category);
}
