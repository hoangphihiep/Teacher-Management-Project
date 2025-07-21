package com.teacher.managerment.service;

import com.teacher.managerment.dto.CreateLeaveRequestDto;
import com.teacher.managerment.dto.LeaveRequestDto;
import com.teacher.managerment.entity.LeaveRequest;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.repository.LeaveRequestRepository;
import com.teacher.managerment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    public LeaveRequestDto createLeaveRequest(Long teacherId, CreateLeaveRequestDto createDto) {
        System.out.println ("Có vào đây");
        // Validate dates
        if (createDto.getEndDate().isBefore(createDto.getStartDate())) {
            throw new RuntimeException("Ngày kết thúc không thể trước ngày bắt đầu");
        }

        // Check for overlapping leave requests
//        List<LeaveRequest> overlapping = leaveRequestRepository.findOverlappingLeaveRequests(
//                teacherId, createDto.getStartDate(), createDto.getEndDate());

        System.out.println ("Có vào đây1");
//        if (!overlapping.isEmpty()) {
//            throw new RuntimeException("Đã có đơn nghỉ phép trong khoảng thời gian này");
//        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên"));

        System.out.println ("Thông tin giảng viên: " + teacher.getUsername() + teacher.getEmail() + teacher.getId());
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setTeacher(teacher);
        leaveRequest.setLeaveType(createDto.getLeaveType());
        leaveRequest.setStartDate(createDto.getStartDate());
        leaveRequest.setEndDate(createDto.getEndDate());
        leaveRequest.setReason(createDto.getReason());
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return convertToDto(saved);
    }

    public List<LeaveRequestDto> getTeacherLeaveRequests(Long teacherId) {
        List<LeaveRequest> requests = leaveRequestRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
        return requests.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public Page<LeaveRequestDto> getTeacherLeaveRequests(Long teacherId, Pageable pageable) {
        Page<LeaveRequest> requests = leaveRequestRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId, pageable);
        return requests.map(this::convertToDto);
    }

    public List<LeaveRequestDto> getAllLeaveRequests() {
        List<LeaveRequest> requests = leaveRequestRepository.findAll();
        return requests.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public Page<LeaveRequestDto> getAllLeaveRequests(Pageable pageable) {
        Page<LeaveRequest> requests = leaveRequestRepository.findAllByOrderByCreatedAtDesc(pageable);
        return requests.map(this::convertToDto);
    }

    public List<LeaveRequestDto> getPendingLeaveRequests() {
        List<LeaveRequest> requests = leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus.PENDING);
        return requests.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public Page<LeaveRequestDto> getPendingLeaveRequests(Pageable pageable) {
        Page<LeaveRequest> requests = leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus.PENDING, pageable);
        return requests.map(this::convertToDto);
    }

    public LeaveRequestDto approveLeaveRequest(Long requestId, Long adminId, String adminNotes) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn nghỉ phép"));

        if (request.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể phê duyệt đơn đang chờ xử lý");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quản trị viên"));

        request.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        request.setApprovedBy(admin);
        request.setAdminNotes(adminNotes);
        request.setApprovedAt(LocalDateTime.now());

        LeaveRequest saved = leaveRequestRepository.save(request);
        return convertToDto(saved);
    }

    public LeaveRequestDto rejectLeaveRequest(Long requestId, Long adminId, String adminNotes) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn nghỉ phép"));

        if (request.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể từ chối đơn đang chờ xử lý");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quản trị viên"));

        request.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        request.setApprovedBy(admin);
        request.setAdminNotes(adminNotes);
        request.setApprovedAt(LocalDateTime.now());

        LeaveRequest saved = leaveRequestRepository.save(request);
        return convertToDto(saved);
    }

    public LeaveRequestDto cancelLeaveRequest(Long requestId, Long userId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn nghỉ phép"));

        if (!request.getTeacher().getId().equals(userId)) {
            throw new RuntimeException("Bạn chỉ có thể hủy đơn nghỉ phép của mình");
        }

        if (request.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn đang chờ xử lý");
        }

        request.setStatus(LeaveRequest.LeaveStatus.CANCELLED);
        LeaveRequest saved = leaveRequestRepository.save(request);
        return convertToDto(saved);
    }

    public LeaveRequestDto getLeaveRequestById(Long requestId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn nghỉ phép"));
        return convertToDto(request);
    }

    public Long countPendingRequests() {
        return leaveRequestRepository.countByStatus(LeaveRequest.LeaveStatus.PENDING);
    }

    public Long countActiveLeaves() {
        return leaveRequestRepository.countActiveLeaves();
    }

    public Long getTotalRequestsCount() {
        return leaveRequestRepository.count();
    }

    // Bổ sung 2 method mới cho admin stats
    public Long getApprovedLeaveRequests() {
        return leaveRequestRepository.countApprovedRequests();
    }

    public Long getRejectedLeaveRequests() {
        return leaveRequestRepository.countRejectedRequests();
    }

    private LeaveRequestDto convertToDto(LeaveRequest request) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(request.getId());
        dto.setTeacherId(request.getTeacher().getId());
        dto.setTeacherName(request.getTeacher().getFullName());
        dto.setTeacherEmail(request.getTeacher().getEmail());
        dto.setLeaveType(request.getLeaveType());
        dto.setLeaveTypeDisplay(request.getLeaveType().getDisplayName());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus());
        dto.setStatusDisplay(request.getStatus().getDisplayName());

        if (request.getApprovedBy() != null) {
            dto.setApprovedById(request.getApprovedBy().getId());
            dto.setApprovedByName(request.getApprovedBy().getFullName());
        }

        dto.setAdminNotes(request.getAdminNotes());
        dto.setApprovedAt(request.getApprovedAt());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());

        // Calculate total days
        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        dto.setTotalDays((int) days);

        return dto;
    }
}
