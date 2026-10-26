package com.peerreview.repository;

import com.peerreview.model.CodeSubmission;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<CodeSubmission, Long> {
    List<CodeSubmission> findByStudent_IdOrderByCreatedAtDesc(Long studentId);
    List<CodeSubmission> findAllByOrderByCreatedAtDesc();
}
