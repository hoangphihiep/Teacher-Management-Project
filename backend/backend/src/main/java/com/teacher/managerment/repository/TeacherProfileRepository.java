package com.teacher.managerment.repository;

import com.teacher.managerment.entity.TeacherProfile;
import com.teacher.managerment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, Long> {
    Optional<TeacherProfile> findByUser(User user);

    @Query("SELECT tp FROM TeacherProfile tp LEFT JOIN FETCH tp.user WHERE tp.user.username = :username")
    Optional<TeacherProfile> findByUserUsername(@Param("username") String username);

    @Query("SELECT tp FROM TeacherProfile tp LEFT JOIN FETCH tp.user WHERE tp.user.id = :userId")
    Optional<TeacherProfile> findByUserId(@Param("userId") Long userId);
}
