package com.teacher.managerment.service;

import com.teacher.managerment.dto.CreateMessageDto;
import com.teacher.managerment.dto.MessageDto;
import com.teacher.managerment.dto.MessageRecipientDto;
import com.teacher.managerment.entity.Message;
import com.teacher.managerment.entity.MessageRecipient;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.repository.MessageRecipientRepository;
import com.teacher.managerment.repository.MessageRepository;
import com.teacher.managerment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageRecipientRepository messageRecipientRepository;

    @Autowired
    private UserRepository userRepository;

    public MessageDto sendMessage(Long senderId, CreateMessageDto createDto) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi"));

        Message message = new Message();
        message.setSender(sender);
        message.setSubject(createDto.getSubject());
        message.setContent(createDto.getContent());
        message.setMessageType(createDto.getMessageType());
        message.setPriority(createDto.getPriority());
        message.setIsBroadcast(createDto.getIsBroadcast());

        Message savedMessage = messageRepository.save(message);

        // Create recipients
        List<MessageRecipient> recipients = new ArrayList<>();

        if (createDto.getIsBroadcast()) {
            // Send to all users except sender
            List<User> allUsers = userRepository.findAll();
            for (User user : allUsers) {
                if (!user.getId().equals(senderId)) {
                    MessageRecipient recipient = new MessageRecipient();
                    recipient.setMessage(savedMessage);
                    recipient.setRecipient(user);
                    recipients.add(recipient);
                }
            }
        } else {
            // Send to specific recipients
            if (createDto.getRecipientIds() != null && !createDto.getRecipientIds().isEmpty()) {
                for (Long recipientId : createDto.getRecipientIds()) {
                    User recipient = userRepository.findById(recipientId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy người nhận với ID: " + recipientId));

                    MessageRecipient messageRecipient = new MessageRecipient();
                    messageRecipient.setMessage(savedMessage);
                    messageRecipient.setRecipient(recipient);
                    recipients.add(messageRecipient);
                }
            }
        }

        messageRecipientRepository.saveAll(recipients);
        savedMessage.setRecipients(recipients);

        return convertToDto(savedMessage, null);
    }

    public List<MessageDto> getSentMessages(Long senderId) {
        List<Message> messages = messageRepository.findBySenderIdOrderByCreatedAtDesc(senderId);
        return messages.stream().map(message -> convertToDto(message, null)).collect(Collectors.toList());
    }

    public Page<MessageDto> getSentMessages(Long senderId, Pageable pageable) {
        Page<Message> messages = messageRepository.findBySenderIdOrderByCreatedAtDesc(senderId, pageable);
        return messages.map(message -> convertToDto(message, null));
    }

    public List<MessageDto> getReceivedMessages(Long recipientId) {
        System.out.println ("Có vào get Received Messages");
        List<Message> messages = messageRepository.findReceivedMessages(recipientId);
        System.out.println("Danh sách tin nhắn trong service:");
        for (Message m : messages){
            System.out.println ("Thông tin của tin nhắn: " + m.getContent() + "id message" + m.getId());
        }
        System.out.println ("id của recipientId: " + recipientId);
        return messages.stream().map(message -> {
            System.out.println("→ Đang xử lý message ID: " + message.getId());

            Optional<MessageRecipient> recipient = messageRecipientRepository.findByMessageIdAndRecipientId(message.getId(), recipientId);
            if (recipient.isPresent()) {
                System.out.println("✅ Tìm thấy MessageRecipient cho message ID: " + message.getId());
            } else {
                System.out.println("❌ KHÔNG tìm thấy MessageRecipient cho message ID: " + message.getId());
            }

            MessageDto dto = convertToDto(message, recipient.orElse(null));
            System.out.println("→ Đã chuyển đổi thành DTO: " + dto); // nếu bạn có override toString()

            return dto;
        }).collect(Collectors.toList());
    }

    public Page<MessageDto> getReceivedMessages(Long recipientId, Pageable pageable) {
        Page<Message> messages = messageRepository.findReceivedMessages(recipientId, pageable);
        return messages.map(message -> {
            Optional<MessageRecipient> recipient = messageRecipientRepository.findByMessageIdAndRecipientId(message.getId(), recipientId);
            return convertToDto(message, recipient.orElse(null));
        });
    }

    public List<MessageDto> getUnreadMessages(Long recipientId) {
        List<Message> messages = messageRepository.findUnreadMessages(recipientId);
        return messages.stream().map(message -> {
            Optional<MessageRecipient> recipient = messageRecipientRepository.findByMessageIdAndRecipientId(message.getId(), recipientId);
            return convertToDto(message, recipient.orElse(null));
        }).collect(Collectors.toList());
    }

    public MessageDto markMessageAsRead(Long messageId, Long recipientId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

        MessageRecipient recipient = messageRecipientRepository.findByMessageIdAndRecipientId(messageId, recipientId)
                .orElseThrow(() -> new RuntimeException("Bạn không có quyền đọc tin nhắn này"));

        if (!recipient.getIsRead()) {
            recipient.setIsRead(true);
            recipient.setReadAt(LocalDateTime.now());
            messageRecipientRepository.save(recipient);
        }

        return convertToDto(message, recipient);
    }

    public MessageDto getMessageById(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

        // Check if user is sender or recipient
        if (message.getSender().getId().equals(userId)) {
            return convertToDto(message, null);
        }

        Optional<MessageRecipient> recipient = messageRecipientRepository.findByMessageIdAndRecipientId(messageId, userId);
        if (recipient.isPresent()) {
            return convertToDto(message, recipient.get());
        }

        throw new RuntimeException("Bạn không có quyền xem tin nhắn này");
    }

    public Long countUnreadMessages(Long recipientId) {
        return messageRepository.countUnreadMessages(recipientId);
    }

    public List<MessageDto> getBroadcastMessages() {
        List<Message> messages = messageRepository.findByIsBroadcastTrueOrderByCreatedAtDesc();
        return messages.stream().map(message -> convertToDto(message, null)).collect(Collectors.toList());
    }

    public Page<MessageDto> getBroadcastMessages(Pageable pageable) {
        Page<Message> messages = messageRepository.findByIsBroadcastTrueOrderByCreatedAtDesc(pageable);
        return messages.map(message -> convertToDto(message, null));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    private MessageDto convertToDto(Message message, MessageRecipient recipient) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFullName());
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setSubject(message.getSubject());
        dto.setContent(message.getContent());
        dto.setMessageType(message.getMessageType());
        dto.setMessageTypeDisplay(message.getMessageType().getDisplayName());
        dto.setPriority(message.getPriority());
        dto.setPriorityDisplay(message.getPriority().getDisplayName());
        dto.setIsBroadcast(message.getIsBroadcast());
        dto.setCreatedAt(message.getCreatedAt());

        if (recipient != null) {
            dto.setIsRead(recipient.getIsRead());
            dto.setReadAt(recipient.getReadAt());
        }

        if (message.getRecipients() != null) {
            List<MessageRecipientDto> recipientDtos = message.getRecipients().stream()
                    .map(this::convertRecipientToDto)
                    .collect(Collectors.toList());
            dto.setRecipients(recipientDtos);
        }

        return dto;
    }

    private MessageRecipientDto convertRecipientToDto(MessageRecipient recipient) {
        MessageRecipientDto dto = new MessageRecipientDto();
        dto.setId(recipient.getId());
        dto.setMessageId(recipient.getMessage().getId());
        dto.setRecipientId(recipient.getRecipient().getId());
        dto.setRecipientName(recipient.getRecipient().getFullName());
        dto.setRecipientEmail(recipient.getRecipient().getEmail());
        dto.setIsRead(recipient.getIsRead());
        dto.setReadAt(recipient.getReadAt());
        dto.setCreatedAt(recipient.getCreatedAt());
        return dto;
    }
}
