package com.peerreview.repository;

import com.peerreview.model.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("update Notification n set n.read = true where n.user.id = :uid")
    int markAllRead(@Param("uid") Long uid);
}
