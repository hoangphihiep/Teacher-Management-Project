package com.teacher.managerment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.teacher.managerment.config.LarkBaseConfig;
import com.teacher.managerment.dto.lark.*;
import com.teacher.managerment.entity.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class LarkBaseService {

    private static final Logger logger = LoggerFactory.getLogger(LarkBaseService.class);

    @Autowired
    private LarkBaseConfig larkBaseConfig;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper;
    private String accessToken;
    private LocalDateTime tokenExpiry;

    // Định dạng DateTime không có 'Z' (UTC offset)
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public LarkBaseService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.setPropertyNamingStrategy(null);
    }

    // Lấy access token với format response đúng
    private String getAccessToken() {
        if (accessToken != null && tokenExpiry != null && LocalDateTime.now().isBefore(tokenExpiry)) {
            return accessToken;
        }

        String url = larkBaseConfig.getApiUrl() + "/auth/v3/app_access_token/internal";
        logger.info("Requesting access token from: {}", url);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("app_id", larkBaseConfig.getAppId());
        requestBody.put("app_secret", larkBaseConfig.getAppSecret());

        logger.info("Request body: app_id={}", larkBaseConfig.getAppId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<LarkAuthResponse> response = restTemplate.postForEntity(url, request, LarkAuthResponse.class);
            logger.info("Auth response: code={}, msg={}, token={}, expire={}",
                    response.getBody().getCode(),
                    response.getBody().getMsg(),
                    response.getBody().getAppAccessToken() != null ? "***" : "null",
                    response.getBody().getExpire());

            if (response.getBody() != null && response.getBody().getCode() == 0) {
                String token = response.getBody().getAppAccessToken();
                int expiresIn = response.getBody().getExpire();

                if (token != null && !token.isEmpty()) {
                    this.accessToken = token;
                    this.tokenExpiry = LocalDateTime.now().plusSeconds(expiresIn - 300); // 5 phút buffer
                    logger.info("Successfully obtained access token, expires in {} seconds", expiresIn);
                    return this.accessToken;
                } else {
                    logger.error("Access token is null or empty in response");
                }
            } else {
                logger.error("API returned error code: {}, message: {}",
                        response.getBody().getCode(), response.getBody().getMsg());
            }

        } catch (Exception e) {
            logger.error("Exception while getting access token", e);
            throw new RuntimeException("Failed to get LarkBase access token: " + e.getMessage());
        }

        throw new RuntimeException("Failed to authenticate with LarkBase - check app credentials");
    }

    // Đồng bộ User vào LarkBase
    public void syncUserToLarkBase(User user, String tableId) {
        try {

            getTableSchema(tableId);
            String token = getAccessToken();
            String url = larkBaseConfig.getApiUrl() + "/bitable/v1/apps/" + larkBaseConfig.getBaseToken() + "/tables/" + tableId + "/records";

            logger.info("Syncing user {} to LarkBase table {}", user.getUsername(), tableId);
            logger.info("Using URL: {}", url);

            // Tạo fields map với Field ID chính xác như trong Lark Base
            Map<String, Object> fields = new LinkedHashMap<>();
            fields.put("ID", user.getId().toString());
            fields.put("Username", user.getUsername());
            fields.put("Full Name", user.getFullName());
            fields.put("Email", user.getEmail());
            fields.put("Role", user.getRole().toString());
            fields.put("Enabled", user.getEnabled());
            fields.put("Created At", user.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            fields.put("Updated At", user.getUpdatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());

            // Try Approach 1: Field names with records array
            boolean success = tryCreateRecordWithFieldNames(url, fields, token, user.getId().toString());
            if (success) {
                logger.info("Successfully synced course {} to LarkBase", user.getId().toString());
            } else {
                throw new RuntimeException("All approaches failed to sync course to LarkBase");
            }

        } catch (Exception e) {
            logger.error("Error syncing user {} to LarkBase", user.getUsername(), e);
            throw new RuntimeException("Error syncing user to LarkBase: " + e.getMessage());
        }
    }

    // Đồng bộ Course vào LarkBase
    private void getTableSchema(String tableId) {
        try {
            String token = getAccessToken();
            String url = larkBaseConfig.getApiUrl() + "/bitable/v1/apps/" + larkBaseConfig.getBaseToken() + "/tables/" + tableId + "/fields";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);

            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);

            logger.info("Table schema: {}", response.getBody());
        } catch (Exception e) {
            logger.error("Error getting table schema", e);
        }
    }

    public void syncCourseToLarkBase(Course course, String tableId) {
        try {
            getTableSchema(tableId);
            String token = getAccessToken();
            String url = larkBaseConfig.getApiUrl() + "/bitable/v1/apps/" + larkBaseConfig.getBaseToken() + "/tables/" + tableId + "/records";
            logger.info("Syncing course {} to LarkBase table {}", course.getCourseCode(), tableId);

            // Debug: In ra URL và token
            logger.info("Request URL: {}", url);
            logger.info("Token exists: {}", token != null && !token.isEmpty());

            // *** APPROACH 1: Try using FIELD NAMES instead of field IDs ***
            Map<String, Object> fields = new HashMap<>();
            fields.put("ID", course.getId().toString());
            fields.put("Course Code", course.getCourseCode());
            fields.put("Course Name", course.getCourseName());
            fields.put("Description", course.getDescription());
            fields.put("Teaching Materials", course.getTeachingMaterials());
            fields.put("Reference Materials", course.getReferenceMaterials());
            fields.put("Active", course.getActive());
            fields.put("Created By", course.getCreatedBy().getFullName());
            fields.put("Created At", course.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            fields.put("Updated At", course.getUpdatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());

            logger.info("Fields with names to sync: {}", fields);

            if (fields.isEmpty()) {
                throw new RuntimeException("No valid fields to sync for course: " + course.getCourseCode());
            }

            // Try Approach 1: Field names with records array
            boolean success = tryCreateRecordWithFieldNames(url, fields, token, course.getCourseCode());
            if (success) {
                logger.info("Successfully synced course {} to LarkBase", course.getCourseCode());
            } else {
                throw new RuntimeException("All approaches failed to sync course to LarkBase");
            }

        } catch (Exception e) {
            logger.error("Error syncing course {} to LarkBase", course.getCourseCode(), e);
            throw new RuntimeException("Error syncing course to LarkBase: " + e.getMessage());
        }
    }

    private boolean tryCreateRecordWithFieldNames(String url, Map<String, Object> fields, String token, String courseCode) {
        try {
            logger.info("Trying /records with field names");

            // Format: {"fields": {"Course Code": "CS101", ...}}
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("fields", fields);

            return executeRequest(url, requestBody, token);

        } catch (Exception e) {
            logger.warn("Field names approach failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean executeRequest(String url, Map<String, Object> requestBody, String token) {
        try {
            logger.info("Executing request to: {}", url);
            logger.info("Request body: {}", requestBody);

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            logger.info("Request JSON: {}", jsonBody);

            // Validate JSON
            objectMapper.readTree(jsonBody);
            logger.info("JSON is valid");

            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);

            // Send request
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            logger.info("Response status: {}", response.getStatusCode());
            logger.info("Response body: {}", response.getBody());

            // Parse response
            Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
            Integer code = (Integer) responseMap.get("code");

            if (code == null || code != 0) {
                String msg = (String) responseMap.get("msg");
                logger.warn("API returned error - Code: {}, Message: {}", code, msg);
                return false;
            }

            logger.info("Request successful!");
            return true;

        } catch (HttpClientErrorException e) {
            logger.warn("HTTP error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            logger.warn("Request failed: {}", e.getMessage());
            return false;
        }
    }
    // Đồng bộ WorkSchedule vào LarkBase
    public void syncWorkScheduleToLarkBase(WorkSchedule schedule, String tableId) {
        try {
            getTableSchema(tableId);
            String token = getAccessToken();
            String url = larkBaseConfig.getApiUrl() + "/bitable/v1/apps/" + larkBaseConfig.getBaseToken() + "/tables/" + tableId + "/records";

            logger.info("Syncing work schedule {} to LarkBase table {}", schedule.getId(), tableId);

            Map<String, Object> fields = new LinkedHashMap<>();
            fields.put("ID", schedule.getId().toString());
            fields.put("Teacher", schedule.getTeacher().getFullName());
            fields.put("Work Date", schedule.getWorkDate().toString());
            fields.put("Start Time", schedule.getStartTime().toString());
            fields.put("End Time", schedule.getEndTime().toString());
            fields.put("Work Type", schedule.getWorkType().getDisplayName());
            fields.put("Location", schedule.getLocation());
            fields.put("Content", schedule.getContent());
            fields.put("Notes", schedule.getNotes());
            fields.put("Attendance Status", schedule.getAttendanceStatus().getDisplayName());
            fields.put("Duration", schedule.getDuration());
            fields.put("Is Recurring", schedule.getIsRecurring());
            fields.put("Created By", schedule.getCreatedBy().getFullName());
            fields.put("Created At", schedule.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());

            // Try Approach 1: Field names with records array
            boolean success = tryCreateRecordWithFieldNames(url, fields, token, schedule.getId().toString());
            if (success) {
                logger.info("Successfully synced course {} to LarkBase", schedule.getId().toString());
            } else {
                throw new RuntimeException("All approaches failed to sync course to LarkBase");
            }

        } catch (Exception e) {
            logger.error("Error syncing work schedule {} to LarkBase", schedule.getId(), e);
            throw new RuntimeException("Error syncing work schedule to LarkBase: " + e.getMessage());
        }
    }

    // Đồng bộ LeaveRequest vào LarkBase
    public void syncLeaveRequestToLarkBase(LeaveRequest leaveRequest, String tableId) {
        try {
            String token = getAccessToken();
            String url = larkBaseConfig.getApiUrl() + "/bitable/v1/apps/" + larkBaseConfig.getBaseToken() + "/tables/" + tableId + "/records";

            logger.info("Syncing leave request {} to LarkBase table {}", leaveRequest.getId(), tableId);

            Map<String, Object> fields = new LinkedHashMap<>();
            fields.put("ID", leaveRequest.getId().toString());
            fields.put("Teacher", leaveRequest.getTeacher().getFullName());
            fields.put("Leave Type", leaveRequest.getLeaveType().toString());
            fields.put("Start Date", leaveRequest.getStartDate().toString());
            fields.put("End Date", leaveRequest.getEndDate().toString());
            fields.put("Reason", leaveRequest.getReason());
            fields.put("Status", leaveRequest.getStatus().toString());
            fields.put("Admin Notes", leaveRequest.getAdminNotes());
            fields.put("Created At", leaveRequest.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());

            // Try Approach 1: Field names with records array
            boolean success = tryCreateRecordWithFieldNames(url, fields, token, leaveRequest.getId().toString());
            if (success) {
                logger.info("Successfully synced course {} to LarkBase", leaveRequest.getId().toString());
            } else {
                throw new RuntimeException("All approaches failed to sync course to LarkBase");
            }

        } catch (Exception e) {
            logger.error("Error syncing leave request {} to LarkBase", leaveRequest.getId(), e);
            throw new RuntimeException("Error syncing leave request to LarkBase: " + e.getMessage());
        }
    }

    // Test connection với LarkBase
    public boolean testConnection() {
        try {
            String token = getAccessToken();
            return token != null && !token.isEmpty();
        } catch (Exception e) {
            logger.error("Failed to test LarkBase connection", e);
            return false;
        }
    }
}
