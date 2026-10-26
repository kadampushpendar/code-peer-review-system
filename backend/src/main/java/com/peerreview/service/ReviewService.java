package com.peerreview.service;

import com.peerreview.dto.Dtos.CommentRequest;
import com.peerreview.dto.Dtos.CommentResponse;
import com.peerreview.dto.Dtos.ReviewResponse;
import com.peerreview.dto.Dtos.ReviewSubmitRequest;
import com.peerreview.exception.ApiException;
import com.peerreview.model.Comment;
import com.peerreview.model.Review;
import com.peerreview.model.ReviewStatus;
import com.peerreview.model.Teacher;
import com.peerreview.model.User;
import com.peerreview.repository.CommentRepository;
import com.peerreview.repository.ReviewRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {
    private final ReviewRepository reviews;
    private final CommentRepository comments;
    private final ReviewMapper mapper;
    private final NotificationService notifications;

    public ReviewService(ReviewRepository reviews, CommentRepository comments, ReviewMapper mapper,
                         NotificationService notifications) {
        this.reviews = reviews;
        this.comments = comments;
        this.mapper = mapper;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> assignedTo(User me) {
        return reviews.findByReviewer_IdOrderByCreatedAtDesc(me.getId()).stream()
                .map(r -> mapper.review(r, false)).toList();
    }

    @Transactional(readOnly = true)
    public ReviewResponse get(Long id, User me) {
        Review r = find(id);
        boolean reviewer = r.getReviewer().getId().equals(me.getId());
        boolean author = r.getSubmission().getStudent().getId().equals(me.getId());
        if (!(me instanceof Teacher) && !reviewer && !author) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You cannot view this review");
        }
        return mapper.review(r, true);
    }

    @Transactional
    public CommentResponse addComment(Long id, User me, CommentRequest req) {
        Review r = find(id);
        requireOpenReviewer(r, me);
        int lines = r.getSubmission().getSourceCode().split("\n", -1).length;
        if (req.lineNumber() > lines) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The code only has " + lines + " lines");
        }
        Comment c = comments.save(new Comment(r, req.lineNumber(), req.commentText().trim(), req.severity()));
        return new CommentResponse(c.getId(), c.getLineNumber(), c.getCommentText(), c.getSeverity());
    }

    @Transactional
    public ReviewResponse submit(Long id, User me, ReviewSubmitRequest req) {
        Review r = find(id);
        requireOpenReviewer(r, me);
        r.addFeedback(req.feedback().trim());
        r.setScore(req.score());
        r.submitReview();
        r.getSubmission().markReviewed();
        notifications.send(r.getSubmission().getStudent(),
                me.getName() + " reviewed " + r.getSubmission().getTitle() + ". Feedback is ready.");
        return mapper.review(r, true);
    }

    private void requireOpenReviewer(Review r, User me) {
        if (!r.getReviewer().getId().equals(me.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the assigned reviewer can do this");
        }
        if (r.getStatus() == ReviewStatus.SUBMITTED) {
            throw new ApiException(HttpStatus.CONFLICT, "This review has already been submitted");
        }
    }

    private Review find(Long id) {
        return reviews.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
    }
}
