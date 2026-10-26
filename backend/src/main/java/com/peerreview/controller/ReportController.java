package com.peerreview.controller;

import com.peerreview.dto.Dtos.ReportResponse;
import com.peerreview.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Teacher only (enforced in SecurityConfig). */
@RestController
@RequestMapping("/api/teacher")
public class ReportController {
    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @GetMapping("/reports")
    public ReportResponse reports() {
        return service.build();
    }
}
