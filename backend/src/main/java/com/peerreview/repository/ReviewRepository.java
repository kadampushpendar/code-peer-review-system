package com.peerreview.repository;

import com.peerreview.model.Review;
import com.peerreview.model.ReviewStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findBySubmission_Id(Long submissionId);
    List<Review> findByReviewer_IdOrderByCreatedAtDesc(Long reviewerId);
    long countByReviewer_IdAndStatus(Long reviewerId, ReviewStatus status);
}
