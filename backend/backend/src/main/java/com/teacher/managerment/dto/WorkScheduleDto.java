package com.teacher.managerment.dto;

import com.teacher.managerment.entity.WorkSchedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleDto {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private String workDate;
    private String startTime;
    private String endTime;
    private String workType;
    private String workTypeDisplay;
    private String workTypeColor;
    private String location;
    private String content;
    private String notes;
    private String attendanceStatus;
    private String attendanceStatusDisplay;
    private String attendanceNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Double duration;

    public static WorkScheduleDto fromEntity(WorkSchedule workSchedule) {
        WorkScheduleDto dto = new WorkScheduleDto();
        dto.setId(workSchedule.getId());
        dto.setTeacherId(workSchedule.getTeacher().getId());
        dto.setTeacherName(workSchedule.getTeacher().getFullName());
        dto.setWorkDate(workSchedule.getWorkDate().toString());
        dto.setStartTime(workSchedule.getStartTime().toString());
        dto.setEndTime(workSchedule.getEndTime().toString());
        dto.setWorkType(workSchedule.getWorkType().name());
        dto.setWorkTypeDisplay(workSchedule.getWorkType().getDisplayName());
        dto.setWorkTypeColor(workSchedule.getWorkType().getColor());
        dto.setLocation(workSchedule.getLocation());
        dto.setContent(workSchedule.getContent());
        dto.setNotes(workSchedule.getNotes());
        dto.setAttendanceStatus(workSchedule.getAttendanceStatus().name());
        dto.setAttendanceStatusDisplay(workSchedule.getAttendanceStatus().getDisplayName());
        dto.setAttendanceNotes(workSchedule.getAttendanceNotes());
        dto.setCreatedAt(workSchedule.getCreatedAt());
        dto.setUpdatedAt(workSchedule.getUpdatedAt());
        dto.setCreatedBy(workSchedule.getCreatedBy() != null ? workSchedule.getCreatedBy().getId() : null);
        dto.setDuration(workSchedule.getDuration());
        return dto;
    }
}
