package com.teacher.managerment.dto;

import com.teacher.managerment.entity.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMessageDto {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String subject;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 5000, message = "Nội dung không được vượt quá 5000 ký tự")
    private String content;

    @NotNull(message = "Loại tin nhắn không được để trống")
    private Message.MessageType messageType;

    private Message.MessagePriority priority = Message.MessagePriority.NORMAL;

    private Boolean isBroadcast = false;

    private List<Long> recipientIds;
}
