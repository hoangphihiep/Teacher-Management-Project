package com.teacher.managerment.service;

import com.teacher.managerment.entity.*;
import com.teacher.managerment.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class LarkBaseSyncService {

    private static final Logger logger = LoggerFactory.getLogger(LarkBaseSyncService.class);

    @Autowired
    private LarkBaseService larkBaseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private WorkScheduleRepository workScheduleRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    // Table IDs trong LarkBase (cần cấu hình)
    @Value("${larkbase.table.users}")
    private String usersTableId;

    @Value("${larkbase.table.courses}")
    private String coursesTableId;

    @Value("${larkbase.table.schedules}")
    private String schedulesTableId;

    @Value("${larkbase.table.leave-requests}")
    private String leaveRequestsTableId;

    // Đồng bộ tất cả users
    @Async
    public CompletableFuture<Void> syncAllUsers() {
        try {
            logger.info("Starting sync all users to LarkBase");
            List<User> users = userRepository.findAll();
            logger.info("Found {} users to sync", users.size());

            for (User user : users) {
                try {
                    larkBaseService.syncUserToLarkBase(user, usersTableId);
                    Thread.sleep(100); // Tránh rate limit
                } catch (Exception e) {
                    logger.error("Failed to sync user {}: {}", user.getUsername(), e.getMessage());
                    // Continue với user khác
                }
            }

            logger.info("Completed sync all users to LarkBase");
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            logger.error("Failed to sync users", e);
            throw new RuntimeException("Failed to sync users: " + e.getMessage());
        }
    }

    // Đồng bộ tất cả courses
    @Async
    public CompletableFuture<Void> syncAllCourses() {
        try {
            logger.info("Starting sync all courses to LarkBase");
            List<Course> courses = courseRepository.findAll();
            logger.info("Found {} courses to sync", courses.size());

            for (Course course : courses) {
                try {
                    larkBaseService.syncCourseToLarkBase(course, coursesTableId);
                    Thread.sleep(100); // Tránh rate limit
                } catch (Exception e) {
                    logger.error("Failed to sync course {}: {}", course.getCourseCode(), e.getMessage());
                    // Continue với course khác
                }
            }

            logger.info("Completed sync all courses to LarkBase");
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            logger.error("Failed to sync courses", e);
            throw new RuntimeException("Failed to sync courses: " + e.getMessage());
        }
    }

    // Đồng bộ tất cả work schedules
    @Async
    public CompletableFuture<Void> syncAllWorkSchedules() {
        try {
            logger.info("Starting sync all work schedules to LarkBase");
            List<WorkSchedule> schedules = workScheduleRepository.findAll();
            logger.info("Found {} work schedules to sync", schedules.size());

            for (WorkSchedule schedule : schedules) {
                try {
                    larkBaseService.syncWorkScheduleToLarkBase(schedule, schedulesTableId);
                    Thread.sleep(100); // Tránh rate limit
                } catch (Exception e) {
                    logger.error("Failed to sync work schedule {}: {}", schedule.getId(), e.getMessage());
                    // Continue với schedule khác
                }
            }

            logger.info("Completed sync all work schedules to LarkBase");
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            logger.error("Failed to sync work schedules", e);
            throw new RuntimeException("Failed to sync work schedules: " + e.getMessage());
        }
    }

    // Đồng bộ tất cả leave requests
    @Async
    public CompletableFuture<Void> syncAllLeaveRequests() {
        try {
            logger.info("Starting sync all leave requests to LarkBase");
            List<LeaveRequest> leaveRequests = leaveRequestRepository.findAll();
            logger.info("Found {} leave requests to sync", leaveRequests.size());

            for (LeaveRequest leaveRequest : leaveRequests) {
                try {
                    larkBaseService.syncLeaveRequestToLarkBase(leaveRequest, leaveRequestsTableId);
                    Thread.sleep(100); // Tránh rate limit
                } catch (Exception e) {
                    logger.error("Failed to sync leave request {}: {}", leaveRequest.getId(), e.getMessage());
                    // Continue với leave request khác
                }
            }

            logger.info("Completed sync all leave requests to LarkBase");
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            logger.error("Failed to sync leave requests", e);
            throw new RuntimeException("Failed to sync leave requests: " + e.getMessage());
        }
    }

    // Đồng bộ toàn bộ dữ liệu
    @Async
    public CompletableFuture<Void> syncAllData() {
        try {
            logger.info("Starting sync all data to LarkBase");

            CompletableFuture<Void> usersSync = syncAllUsers();
            CompletableFuture<Void> coursesSync = syncAllCourses();
            CompletableFuture<Void> schedulesSync = syncAllWorkSchedules();
            CompletableFuture<Void> leaveRequestsSync = syncAllLeaveRequests();

            CompletableFuture.allOf(usersSync, coursesSync, schedulesSync, leaveRequestsSync).join();

            logger.info("Completed sync all data to LarkBase");
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            logger.error("Failed to sync all data", e);
            throw new RuntimeException("Failed to sync all data: " + e.getMessage());
        }
    }

    // Đồng bộ tự động theo lịch (mỗi giờ) - tạm thời disable
    // @Scheduled(fixedRate = 3600000) // 1 hour
    public void scheduledSync() {
        try {
            logger.info("Starting scheduled sync");
            syncAllData();
            logger.info("Completed scheduled sync");
        } catch (Exception e) {
            logger.error("Scheduled sync failed: {}", e.getMessage());
        }
    }

    // Đồng bộ một user cụ thể
    public void syncUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        larkBaseService.syncUserToLarkBase(user, usersTableId);
    }

    // Đồng bộ một course cụ thể
    public void syncCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        larkBaseService.syncCourseToLarkBase(course, coursesTableId);
    }

    // Đồng bộ một work schedule cụ thể
    public void syncWorkSchedule(Long scheduleId) {
        WorkSchedule schedule = workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Work schedule not found"));
        larkBaseService.syncWorkScheduleToLarkBase(schedule, schedulesTableId);
    }

    // Đồng bộ một leave request cụ thể
    public void syncLeaveRequest(Long leaveRequestId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        larkBaseService.syncLeaveRequestToLarkBase(leaveRequest, leaveRequestsTableId);
    }
}
