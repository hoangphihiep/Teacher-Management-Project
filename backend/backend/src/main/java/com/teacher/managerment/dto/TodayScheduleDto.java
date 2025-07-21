package com.teacher.managerment.dto;

import com.teacher.managerment.entity.WorkSchedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TodayScheduleDto {
    private Long id;
    private String subject;
    private String className;
    private String room;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String notes;
    // Constructors
    public TodayScheduleDto(WorkSchedule schedule) {
        this.id = schedule.getId();
        this.subject = schedule.getAttendanceNotes();
        this.className = schedule.getContent();;
        this.room = schedule.getLocation();
        this.startTime = schedule.getStartTime();
        this.endTime = schedule.getEndTime();
        this.status = schedule.getAttendanceStatus().toString();
        this.notes = schedule.getNotes();
    }
}
