package com.teacher.managerment.dto;

import com.teacher.managerment.entity.WorkSchedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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
    private String createdAt;
    private String updatedAt;
    private Long createdBy;
    private Double duration;

    // Recurring fields
    private Boolean isRecurring;
    private String recurringEndDate;
    private Long parentScheduleId;
    private Integer weekNumber;
    private Boolean isParentRecurring;
    private Boolean isChildRecurring;

    public static WorkScheduleDto fromEntity(WorkSchedule schedule) {
        WorkScheduleDto dto = new WorkScheduleDto();
        dto.setId(schedule.getId());
        dto.setTeacherId(schedule.getTeacher().getId());
        dto.setTeacherName(schedule.getTeacher().getFullName());
        dto.setWorkDate(schedule.getWorkDate().toString());
        dto.setStartTime(schedule.getStartTime().toString());
        dto.setEndTime(schedule.getEndTime().toString());
        dto.setWorkType(schedule.getWorkType().name());
        dto.setWorkTypeDisplay(schedule.getWorkType().getDisplayName());
        dto.setWorkTypeColor(schedule.getWorkType().getColor());
        dto.setLocation(schedule.getLocation());
        dto.setContent(schedule.getContent());
        dto.setNotes(schedule.getNotes());
        dto.setAttendanceStatus(schedule.getAttendanceStatus().name());
        dto.setAttendanceStatusDisplay(schedule.getAttendanceStatus().getDisplayName());
        dto.setAttendanceNotes(schedule.getAttendanceNotes());
        dto.setCreatedBy(schedule.getCreatedBy() != null ? schedule.getCreatedBy().getId() : null);
        dto.setDuration(schedule.getDuration());

        // Recurring fields
        dto.setIsRecurring(schedule.getIsRecurring());
        dto.setRecurringEndDate(schedule.getRecurringEndDate() != null ? schedule.getRecurringEndDate().toString() : null);
        dto.setParentScheduleId(schedule.getParentScheduleId());
        dto.setWeekNumber(schedule.getWeekNumber());
        dto.setIsParentRecurring(schedule.isParentRecurring());
        dto.setIsChildRecurring(schedule.isChildRecurring());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        dto.setCreatedAt(schedule.getCreatedAt() != null ? schedule.getCreatedAt().format(formatter) : null);
        dto.setUpdatedAt(schedule.getUpdatedAt() != null ? schedule.getUpdatedAt().format(formatter) : null);

        return dto;
    }
}
