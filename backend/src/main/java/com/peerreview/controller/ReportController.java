package com.peerreview.controller;

import com.peerreview.dto.Dtos.ReportResponse;
import com.peerreview.model.User;
import com.peerreview.service.CurrentUser;
import com.peerreview.service.ReportService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Teacher only (enforced in SecurityConfig). */
@RestController
@RequestMapping("/api/teacher")
public class ReportController {
    private final ReportService service;
    private final CurrentUser current;

    public ReportController(ReportService service, CurrentUser current) {
        this.service = service;
        this.current = current;
    }

    @GetMapping("/reports")
    public ReportResponse reports(Authentication auth) {
        User user = current.of(auth);
        return service.build(user.getId());
    }
}
