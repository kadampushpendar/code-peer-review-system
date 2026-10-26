package com.peerreview.controller;

import com.peerreview.dto.Dtos.SubmissionRequest;
import com.peerreview.dto.Dtos.SubmissionResponse;
import com.peerreview.service.CurrentUser;
import com.peerreview.service.SubmissionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService service;
    private final CurrentUser current;

    public SubmissionController(SubmissionService service, CurrentUser current) {
        this.service = service;
        this.current = current;
    }

    @GetMapping
    public List<SubmissionResponse> list(Authentication auth) {
        return service.list(current.of(auth));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubmissionResponse create(Authentication auth, @Valid @RequestBody SubmissionRequest req) {
        return service.create(current.of(auth), req);
    }

    @GetMapping("/{id}")
    public SubmissionResponse get(Authentication auth, @PathVariable Long id) {
        return service.get(id, current.of(auth));
    }

    /** Teacher only. Optional ?reviewerId= picks a specific student; otherwise the least-busy student is chosen. */
    @PostMapping("/{id}/assign")
    public SubmissionResponse assign(@PathVariable Long id, @RequestParam(required = false) Long reviewerId) {
        return service.assign(id, reviewerId);
    }
}
