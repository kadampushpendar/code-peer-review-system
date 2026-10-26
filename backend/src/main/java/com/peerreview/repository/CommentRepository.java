package com.peerreview.repository;

import com.peerreview.model.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByReview_IdOrderByLineNumberAsc(Long reviewId);
    long countByReview_Id(Long reviewId);
}
