package com.teacher.managerment.dto;

import com.teacher.managerment.entity.LeaveRequest;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLeaveRequestDto {

    @NotNull(message = "Loại nghỉ phép không được để trống")
    private LeaveRequest.LeaveType leaveType;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    @Size(min = 10, max = 1000, message = "Lý do nghỉ phép phải từ 10 đến 1000 ký tự")
    private String reason;
}
