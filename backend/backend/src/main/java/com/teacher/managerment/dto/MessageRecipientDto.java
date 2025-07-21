package com.teacher.managerment.dto;

import com.teacher.managerment.entity.MessageRecipient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageRecipientDto {
    private Long id;
    private Long messageId;
    private Long recipientId;
    private String recipientName;
    private String recipientEmail;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public MessageRecipientDto(MessageRecipient messageRecipient) {
        this.id = messageRecipient.getId();
        this.messageId = messageRecipient.getMessage().getId(); // Assuming MessageRecipient has a getMessage() method
        this.recipientId = messageRecipient.getRecipient().getId();
        this.recipientName = messageRecipient.getRecipient().getFullName();
        this.recipientEmail = messageRecipient.getRecipient().getEmail(); // Assuming Recipient has an getEmail() method
        this.isRead = messageRecipient.getIsRead();
        this.readAt = messageRecipient.getReadAt();
        this.createdAt = messageRecipient.getCreatedAt();
    }
}
