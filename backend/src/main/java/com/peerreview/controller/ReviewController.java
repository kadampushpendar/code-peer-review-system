package com.peerreview.controller;

import com.peerreview.dto.Dtos.CommentRequest;
import com.peerreview.dto.Dtos.CommentResponse;
import com.peerreview.dto.Dtos.ReviewResponse;
import com.peerreview.dto.Dtos.ReviewSubmitRequest;
import com.peerreview.service.CurrentUser;
import com.peerreview.service.ReviewService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService service;
    private final CurrentUser current;

    public ReviewController(ReviewService service, CurrentUser current) {
        this.service = service;
        this.current = current;
    }

    /** Reviews assigned to the logged-in user. */
    @GetMapping
    public List<ReviewResponse> mine(Authentication auth) {
        return service.assignedTo(current.of(auth));
    }

    @GetMapping("/{id}")
    public ReviewResponse get(Authentication auth, @PathVariable Long id) {
        return service.get(id, current.of(auth));
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(Authentication auth, @PathVariable Long id, @Valid @RequestBody CommentRequest req) {
        return service.addComment(id, current.of(auth), req);
    }

    @PatchMapping("/{id}/submit")
    public ReviewResponse submit(Authentication auth, @PathVariable Long id, @Valid @RequestBody ReviewSubmitRequest req) {
        return service.submit(id, current.of(auth), req);
    }
}
