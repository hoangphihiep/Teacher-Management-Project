package com.teacher.managerment.repository;

import com.teacher.managerment.entity.Activity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Activity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.user.id = :userId AND a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<Activity> findRecentActivitiesByUserId(@Param("userId") Long userId, @Param("since") LocalDateTime since, Pageable pageable);

    List<Activity> findByTypeAndUserIdOrderByCreatedAtDesc(Activity.ActivityType type, Long userId);
}