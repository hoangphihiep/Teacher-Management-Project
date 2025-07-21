package com.teacher.managerment.dto;

import com.teacher.managerment.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String subject;
    private String content;
    private Message.MessageType messageType;
    private String messageTypeDisplay;
    private Message.MessagePriority priority;
    private String priorityDisplay;
    private Boolean isBroadcast;
    private LocalDateTime createdAt;
    private List<MessageRecipientDto> recipients;
    private Boolean isRead;
    private LocalDateTime readAt;

    // Constructors
    public MessageDto(Message message) {
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.senderName = message.getSender().getFullName();
        this.senderEmail = message.getSender().getEmail();
        this.subject = message.getSubject();
        this.content = message.getContent();
        this.messageType = message.getMessageType();
        this.messageTypeDisplay = message.getMessageType().getDisplayName();
        this.priority = message.getPriority();
        this.priorityDisplay = message.getPriority().getDisplayName();
        this.isBroadcast = message.getIsBroadcast();
        this.createdAt = message.getCreatedAt();
        if (message.getRecipients() != null) {
            this.recipients = message.getRecipients().stream()
                    .map(MessageRecipientDto::new)
                    .collect(java.util.stream.Collectors.toList());
        }
    }

    public MessageDto(Message message, Boolean isRead, LocalDateTime readAt) {
        this(message);
        this.isRead = isRead;
        this.readAt = readAt;
    }
}
