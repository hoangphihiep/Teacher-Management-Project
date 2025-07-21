package com.teacher.managerment.repository;

import com.teacher.managerment.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    Page<LeaveRequest> findByTeacherIdOrderByCreatedAtDesc(Long teacherId, Pageable pageable);

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus status);

    Page<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus status, Pageable pageable);

    Page<LeaveRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Long countByStatus(LeaveRequest.LeaveStatus status);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.teacher.id = :teacherId " +
            "AND lr.status IN :statuses " +
            "AND ((lr.startDate <= :endDate AND lr.endDate >= :startDate))")
    List<LeaveRequest> findOverlappingLeaveRequests(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.teacher.id = :teacherId " +
            "AND lr.startDate >= :startDate AND lr.endDate <= :endDate " +
            "ORDER BY lr.startDate")
    List<LeaveRequest> findByTeacherIdAndDateRange(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.status = 'PENDING'")
    Long countPendingRequests();

    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.status = 'APPROVED'")
    Long countApprovedRequests();

    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.status = 'REJECTED'")
    Long countRejectedRequests();

    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.status = 'APPROVED' AND lr.startDate <= CURRENT_DATE AND lr.endDate >= CURRENT_DATE")
    Long countActiveLeaves();
}
