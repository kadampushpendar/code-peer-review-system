package com.peerreview.controller;

import com.peerreview.dto.Dtos.NotificationResponse;
import com.peerreview.service.CurrentUser;
import com.peerreview.service.NotificationService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    private final CurrentUser current;

    public NotificationController(NotificationService service, CurrentUser current) {
        this.service = service;
        this.current = current;
    }

    @GetMapping
    public List<NotificationResponse> list(Authentication auth) {
        return service.forUser(current.of(auth));
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void readAll(Authentication auth) {
        service.markAllRead(current.of(auth));
    }
}
