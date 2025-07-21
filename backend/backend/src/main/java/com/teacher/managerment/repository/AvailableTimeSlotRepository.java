package com.teacher.managerment.repository;

import com.teacher.managerment.entity.AvailableTimeSlot;
import com.teacher.managerment.entity.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailableTimeSlotRepository extends JpaRepository<AvailableTimeSlot, Long> {
    List<AvailableTimeSlot> findByProfileOrderByDayOfWeekAscStartTimeAsc(TeacherProfile profile);
    void deleteByProfile(TeacherProfile profile);
}

