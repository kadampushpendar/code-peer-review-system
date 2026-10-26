package com.peerreview.service;

import com.peerreview.dto.Dtos.NotificationResponse;
import com.peerreview.model.Notification;
import com.peerreview.model.User;
import com.peerreview.repository.NotificationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public void send(User to, String message) {
        repo.save(new Notification(to, message));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> forUser(User u) {
        return repo.findByUser_IdOrderByCreatedAtDesc(u.getId()).stream().map(NotificationResponse::of).toList();
    }

    @Transactional
    public void markAllRead(User u) {
        repo.markAllRead(u.getId());
    }
}
