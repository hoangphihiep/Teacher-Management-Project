package com.teacher.managerment.repository;

import com.teacher.managerment.entity.WorkSchedule;
import com.teacher.managerment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {

    List<WorkSchedule> findByTeacherAndWorkDateBetweenOrderByWorkDateAscStartTimeAsc(
            User teacher, LocalDate startDate, LocalDate endDate);

    List<WorkSchedule> findByWorkDateBetweenOrderByWorkDateAscStartTimeAsc(
            LocalDate startDate, LocalDate endDate);
    @Query("SELECT s FROM WorkSchedule s WHERE s.teacher.id = :teacherId AND s.workDate = :date ORDER BY s.startTime")
    List<WorkSchedule> findByTeacherIdAndDate(@Param("teacherId") Long teacherId, @Param("date") LocalDate date);

    @Query("SELECT s FROM WorkSchedule s WHERE s.teacher.id = :teacherId AND s.workDate = :date ORDER BY s.startTime")
    List<WorkSchedule> getTodayScheduleForAssistant(@Param("teacherId") Long teacherId, @Param("date") LocalDate date);

    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.teacher.id = :teacherId AND ws.workDate BETWEEN :startDate AND :endDate ORDER BY ws.workDate ASC, ws.startTime ASC")
    List<WorkSchedule> findByTeacherIdAndDateRange(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(ws) FROM WorkSchedule ws WHERE ws.teacher.id = :teacherId AND ws.workDate BETWEEN :startDate AND :endDate")
    long countByTeacherIdAndDateRange(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM((EXTRACT(HOUR FROM ws.endTime) * 3600 + EXTRACT(MINUTE FROM ws.endTime) * 60 + EXTRACT(SECOND FROM ws.endTime)) - " +
            "(EXTRACT(HOUR FROM ws.startTime) * 3600 + EXTRACT(MINUTE FROM ws.startTime) * 60 + EXTRACT(SECOND FROM ws.startTime))) / 3600.0 " +
            "FROM WorkSchedule ws WHERE ws.teacher.id = :teacherId AND ws.workDate BETWEEN :startDate AND :endDate")
    Double sumHoursByTeacherIdAndDateRange(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(ws) FROM WorkSchedule ws WHERE ws.teacher.id = :teacherId AND ws.attendanceStatus = 'NOT_MARKED'")
    long countUnmarkedAttendanceByTeacherId(@Param("teacherId") Long teacherId);

    List<WorkSchedule> findByTeacherOrderByWorkDateDescStartTimeDesc(User teacher);

    @Query("SELECT DISTINCT ws.teacher FROM WorkSchedule ws ORDER BY ws.teacher.fullName")
    List<User> findDistinctTeachers();

    @Query("SELECT COUNT(ws) FROM WorkSchedule ws WHERE ws.teacher.id = :teacherId AND ws.workDate = :date AND ws.workType = 'ROYAL'")
    Long countTodayClassesByTeacherId(@Param("teacherId") Long teacherId, @Param("date") LocalDate date);

    @Query("SELECT SUM((EXTRACT(HOUR FROM ws.endTime) * 3600 + EXTRACT(MINUTE FROM ws.endTime) * 60 + EXTRACT(SECOND FROM ws.endTime)) - " +
            "(EXTRACT(HOUR FROM ws.startTime) * 3600 + EXTRACT(MINUTE FROM ws.startTime) * 60 + EXTRACT(SECOND FROM ws.startTime))) / 3600.0 " +
            "FROM WorkSchedule ws WHERE ws.teacher.id = :teacherId AND ws.workDate BETWEEN :startDate AND :endDate AND ws.workType = 'ROYAL'")
    Long getTotalTeachingHoursByTeacherId(@Param("teacherId") Long teacherId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(ws) FROM WorkSchedule ws WHERE ws.teacher.id = :teacherId AND ws.workDate BETWEEN :startDate AND :endDate AND ws.workType = 'ROYAL' AND ws.attendanceStatus = 'PRESENT'")
    Long countWeeklyClassesByTeacherId(@Param("teacherId") Long teacherId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Recurring schedule queries
    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.parentScheduleId = :parentId ORDER BY ws.workDate ASC")
    List<WorkSchedule> findByParentScheduleId(@Param("parentId") Long parentId);
    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.isRecurring = true AND ws.parentScheduleId IS NULL ORDER BY ws.workDate ASC")
    List<WorkSchedule> findParentRecurringSchedules();
    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.teacher.id = :teacherId AND ws.parentScheduleId = :parentId AND ws.workDate = :date")
    WorkSchedule findByTeacherIdAndParentScheduleIdAndDate(
            @Param("teacherId") Long teacherId,
            @Param("parentId") Long parentId,
            @Param("date") LocalDate date);

    @Query("SELECT COUNT(ws) FROM WorkSchedule ws WHERE ws.parentScheduleId = :parentId")
    long countByParentScheduleId(@Param("parentId") Long parentId);
}
