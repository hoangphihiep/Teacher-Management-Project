package com.teacher.managerment.controller;

import com.teacher.managerment.dto.TeacherProfileDto;
import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.dto.CreateMessageDto;
import com.teacher.managerment.dto.MessageDto;
import com.teacher.managerment.entity.Message;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.security.JwtUtils;
import com.teacher.managerment.service.MessageService;
import com.teacher.managerment.service.TeacherProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private TeacherProfileService profileService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
            @Valid @RequestBody CreateMessageDto createDto,
            HttpServletRequest request) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            MessageDto message = messageService.sendMessage(userId, createDto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tin nhắn đã được gửi thành công", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/sent")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getSentMessages(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            if (size > 0) {
                Pageable pageable = PageRequest.of(page, size);
                Page<MessageDto> messages = messageService.getSentMessages(userId, pageable);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách tin nhắn đã gửi thành công", messages.getContent()));
            } else {
                List<MessageDto> messages = messageService.getSentMessages(userId);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách tin nhắn đã gửi thành công", messages));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/received")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getReceivedMessages(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            System.out.println ("Có vào received! ");
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            System.out.println ("uerId888: " + userId);
            if (size > 0) {
                Pageable pageable = PageRequest.of(page, size);
                Page<MessageDto> messages = messageService.getReceivedMessages(userId, pageable);
                System.out.println (messages.getTotalElements());
                messages.getContent().forEach(msg -> System.out.println("Tin nhắn: " + msg));
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách tin nhắn đã nhận thành công", messages.getContent()));
            } else {
                List<MessageDto> messages = messageService.getReceivedMessages(userId);
                System.out.println("Danh sách tin nhắn:");
                for (MessageDto m : messages){
                    System.out.println ("Thông tin của tin nhắn 1: " + m.getContent() + m.getSubject() + m.getId());
                }
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách tin nhắn đã nhận thành công", messages));
            }
        }
        catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/unread")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getUnreadMessages(HttpServletRequest request) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            List<MessageDto> messages = messageService.getUnreadMessages(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách tin nhắn chưa đọc thành công", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/{messageId}/read")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MessageDto>> markMessageAsRead(
            @PathVariable Long messageId,
            HttpServletRequest request) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            MessageDto message = messageService.markMessageAsRead(messageId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tin nhắn đã được đánh dấu là đã đọc", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{messageId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MessageDto>> getMessageById(
            @PathVariable Long messageId,
            HttpServletRequest request) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            MessageDto message = messageService.getMessageById(messageId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin tin nhắn thành công", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/stats/unread-count")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getUnreadMessagesCount(HttpServletRequest request) {
        try {
            String userName = getUserNameFromRequest(request);
            TeacherProfileDto profile = profileService.getProfileByUsername(userName);
            Long userId = profile.getUserId();
            Long count = messageService.countUnreadMessages(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy số lượng tin nhắn chưa đọc thành công", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/broadcast")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getBroadcastMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size > 0) {
                Pageable pageable = PageRequest.of(page, size);
                Page<MessageDto> messages = messageService.getBroadcastMessages(pageable);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thông báo chung thành công", messages.getContent()));
            } else {
                List<MessageDto> messages = messageService.getBroadcastMessages();
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thông báo chung thành công", messages));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        try {
            List<User> users = messageService.getAllUsers();
            List<Map<String, Object>> userList = users.stream()
                    .map(user -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", user.getId());
                        map.put("username", user.getUsername());
                        map.put("fullName", user.getFullName());
                        map.put("email", user.getEmail());
                        map.put("role", user.getRole());
                        return map;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách người dùng thành công", userList));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/message-types")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getMessageTypes() {
        List<Map<String, String>> messageTypes = Arrays.stream(Message.MessageType.values())
                .map(type -> Map.of(
                        "value", type.name(),
                        "label", type.getDisplayName()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách loại tin nhắn thành công", messageTypes));
    }

    @GetMapping("/priorities")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getMessagePriorities() {
        List<Map<String, String>> priorities = Arrays.stream(Message.MessagePriority.values())
                .map(priority -> Map.of(
                        "value", priority.name(),
                        "label", priority.getDisplayName()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách mức độ ưu tiên thành công", priorities));
    }


    private String getUserNameFromRequest(HttpServletRequest request) {
        String token = jwtUtils.getJwtFromCookies(request);
        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (token != null && jwtUtils.validateJwtToken(token)) {
            return jwtUtils.getUserNameFromJwtToken(token);
        }

        throw new RuntimeException("Token không hợp lệ");
    }
}
