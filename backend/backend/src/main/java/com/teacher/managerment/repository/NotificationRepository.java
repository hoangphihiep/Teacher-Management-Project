package com.teacher.managerment.repository;

import com.teacher.managerment.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTargetUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByTargetUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.targetUser.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.targetUser.id = :userId AND n.priority = 'HIGH' OR n.priority = 'URGENT' ORDER BY n.createdAt DESC")
    List<Notification> findImportantByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.targetUser.id = :userId AND n.isRead = false")
    Long countUnreadByUserId(@Param("userId") Long userId);
}
