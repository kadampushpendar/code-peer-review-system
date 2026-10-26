package com.peerreview.service;

import com.peerreview.dto.Dtos.CommentResponse;
import com.peerreview.dto.Dtos.ReviewResponse;
import com.peerreview.dto.Dtos.SubmissionResponse;
import com.peerreview.model.CodeSubmission;
import com.peerreview.model.Review;
import com.peerreview.repository.CommentRepository;
import com.peerreview.repository.ReviewRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

/** Converts entities to the JSON shapes the frontend receives. */
@Component
public class ReviewMapper {
    private final ReviewRepository reviews;
    private final CommentRepository comments;

    public ReviewMapper(ReviewRepository reviews, CommentRepository comments) {
        this.reviews = reviews;
        this.comments = comments;
    }

    public SubmissionResponse submission(CodeSubmission s, boolean withCode) {
        Optional<Review> r = reviews.findBySubmission_Id(s.getId());
        return new SubmissionResponse(s.getId(), s.getTitle(), s.getDescription(), s.getLanguage(),
                withCode ? s.getSourceCode() : null, s.getStatus().name(), s.getCreatedAt(),
                s.getStudent().getId(), s.getStudent().getName(),
                r.map(Review::getId).orElse(null),
                r.map(x -> x.getReviewer().getName()).orElse(null),
                r.map(x -> x.getStatus().name()).orElse(null),
                r.map(x -> (int) comments.countByReview_Id(x.getId())).orElse(0));
    }

    public ReviewResponse review(Review r, boolean withCode) {
        CodeSubmission s = r.getSubmission();
        List<CommentResponse> cs = comments.findByReview_IdOrderByLineNumberAsc(r.getId()).stream()
                .map(c -> new CommentResponse(c.getId(), c.getLineNumber(), c.getCommentText(), c.getSeverity()))
                .toList();
        return new ReviewResponse(r.getId(), s.getId(), s.getTitle(), s.getDescription(),
                withCode ? s.getSourceCode() : null, s.getStudent().getId(), s.getStudent().getName(),
                r.getReviewer().getId(), r.getReviewer().getName(), r.getStatus().name(),
                r.getFeedback(), r.getScore(), r.getCompletedAt(), cs);
    }
}
