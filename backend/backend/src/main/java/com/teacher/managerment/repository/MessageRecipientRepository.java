package com.teacher.managerment.repository;

import com.teacher.managerment.entity.MessageRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRecipientRepository extends JpaRepository<MessageRecipient, Long> {

    List<MessageRecipient> findByMessageId(Long messageId);

    List<MessageRecipient> findByRecipientId(Long recipientId);

    Optional<MessageRecipient> findByMessageIdAndRecipientId(Long messageId, Long recipientId);

    @Query("SELECT mr FROM MessageRecipient mr WHERE mr.recipient.id = :recipientId AND mr.isRead = false")
    List<MessageRecipient> findUnreadByRecipientId(@Param("recipientId") Long recipientId);

    Long countByRecipientIdAndIsReadFalse(Long recipientId);
}
