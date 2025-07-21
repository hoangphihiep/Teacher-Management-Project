package com.teacher.managerment.repository;

import com.teacher.managerment.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    Page<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId, Pageable pageable);

    List<Message> findByIsBroadcastTrueOrderByCreatedAtDesc();

    Page<Message> findByIsBroadcastTrueOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT m FROM Message m JOIN m.recipients mr WHERE mr.recipient.id = :recipientId ORDER BY m.createdAt DESC")
    List<Message> findReceivedMessages(@Param("recipientId") Long recipientId);

    @Query("SELECT m FROM Message m JOIN m.recipients mr WHERE mr.recipient.id = :recipientId ORDER BY m.createdAt DESC")
    Page<Message> findReceivedMessages(@Param("recipientId") Long recipientId, Pageable pageable);

    @Query("SELECT m FROM Message m JOIN m.recipients mr WHERE mr.recipient.id = :recipientId AND mr.isRead = false ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessages(@Param("recipientId") Long recipientId);

    @Query("SELECT COUNT(m) FROM Message m JOIN m.recipients mr WHERE mr.recipient.id = :recipientId AND mr.isRead = false")
    Long countUnreadMessages(@Param("recipientId") Long recipientId);
}
