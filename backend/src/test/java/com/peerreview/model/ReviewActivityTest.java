package com.peerreview.model;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class ReviewActivityTest {

    @Test
    void recordsCompletionTimeWhenReviewIsSubmitted() {
        Student author = new Student("Author", "author@example.edu", "password");
        Student reviewer = new Student("Reviewer", "reviewer@example.edu", "password");
        CodeSubmission submission = new CodeSubmission(author, "Example.java", null, "JAVA", "class Example {}");
        Review review = new Review(submission, reviewer);

        assertNull(review.getCompletedAt());

        review.addFeedback("Looks good");
        review.setScore(BigDecimal.TEN);
        review.submitReview();

        assertEquals(ReviewStatus.SUBMITTED, review.getStatus());
        assertNotNull(review.getCompletedAt());
    }
}
