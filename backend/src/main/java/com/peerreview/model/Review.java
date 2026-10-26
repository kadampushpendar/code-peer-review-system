package com.peerreview.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

/** One peer review per submission. Implements the Reviewable interface. */
@Entity
@Table(name = "reviews", uniqueConstraints = @UniqueConstraint(columnNames = "submission_id"))
public class Review implements Reviewable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "submission_id")
    private CodeSubmission submission;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(precision = 4, scale = 2)
    private BigDecimal score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status = ReviewStatus.IN_PROGRESS;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    protected Review() { }

    public Review(CodeSubmission submission, User reviewer) {
        this.submission = submission;
        this.reviewer = reviewer;
    }

    @Override
    public void addFeedback(String feedback) {
        if (status == ReviewStatus.SUBMITTED) {
            throw new IllegalStateException("This review has already been submitted");
        }
        this.feedback = feedback;
    }

    /** EXCEPTION HANDLING: an incomplete review is rejected. */
    @Override
    public void submitReview() {
        if (feedback == null || feedback.isBlank()) {
            throw new IllegalStateException("Feedback cannot be empty");
        }
        if (score == null) {
            throw new IllegalStateException("A score is required");
        }
        status = ReviewStatus.SUBMITTED;
        completedAt = Instant.now();
    }

    public void setScore(BigDecimal score) { this.score = score; }

    public Long getId() { return id; }
    public CodeSubmission getSubmission() { return submission; }
    public User getReviewer() { return reviewer; }
    public String getFeedback() { return feedback; }
    public BigDecimal getScore() { return score; }
    public ReviewStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getCompletedAt() { return completedAt; }
}
