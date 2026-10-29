package com.peerreview.repository;

import com.peerreview.model.CodeSubmission;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubmissionRepository extends JpaRepository<CodeSubmission, Long> {
    List<CodeSubmission> findByStudent_IdOrderByCreatedAtDesc(Long studentId);
    @Query("select s from CodeSubmission s where treat(s.student as Student).teacher.id = :teacherId order by s.createdAt desc")
    List<CodeSubmission> findByTeacherIdOrderByCreatedAtDesc(@Param("teacherId") Long teacherId);
    List<CodeSubmission> findAllByOrderByCreatedAtDesc();
}
