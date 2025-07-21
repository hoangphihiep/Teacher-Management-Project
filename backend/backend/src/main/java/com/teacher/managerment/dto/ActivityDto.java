package com.teacher.managerment.dto;

import com.teacher.managerment.entity.Activity;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ActivityDto {
    private Long id;
    private String action;
    private String description;
    private String type;
    private String timeAgo;
    private LocalDateTime createdAt;

    // Constructors
    public ActivityDto() {}

    public ActivityDto(Activity activity) {
        this.id = activity.getId();
        this.action = activity.getAction();
        this.description = activity.getDescription();
        this.type = activity.getType().name().toLowerCase();
        this.createdAt = activity.getCreatedAt();
        this.timeAgo = calculateTimeAgo(activity.getCreatedAt());
    }

    private String calculateTimeAgo(LocalDateTime createdAt) {
        LocalDateTime now = LocalDateTime.now();
        long hours = java.time.Duration.between(createdAt, now).toHours();
        long days = java.time.Duration.between(createdAt, now).toDays();

        if (days > 0) {
            return days + " ngày trước";
        } else if (hours > 0) {
            return hours + " giờ trước";
        } else {
            long minutes = java.time.Duration.between(createdAt, now).toMinutes();
            return minutes + " phút trước";
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTimeAgo() {
        return timeAgo;
    }

    public void setTimeAgo(String timeAgo) {
        this.timeAgo = timeAgo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
