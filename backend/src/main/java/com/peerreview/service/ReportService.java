package com.peerreview.service;

import com.peerreview.dto.Dtos.ParticipationRow;
import com.peerreview.dto.Dtos.ReportResponse;
import com.peerreview.dto.Dtos.ReportRow;
import com.peerreview.model.CodeSubmission;
import com.peerreview.model.Review;
import com.peerreview.model.ReviewStatus;
import com.peerreview.model.Student;
import com.peerreview.repository.CommentRepository;
import com.peerreview.repository.ReviewRepository;
import com.peerreview.repository.SubmissionRepository;
import com.peerreview.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {
    private final UserRepository users;
    private final SubmissionRepository submissions;
    private final ReviewRepository reviews;
    private final CommentRepository comments;

    public ReportService(UserRepository users, SubmissionRepository submissions, ReviewRepository reviews,
                         CommentRepository comments) {
        this.users = users;
        this.submissions = submissions;
        this.reviews = reviews;
        this.comments = comments;
    }

    @Transactional(readOnly = true)
    public ReportResponse build() {
        List<Student> students = users.findAllStudents();
        List<CodeSubmission> subs = submissions.findAllByOrderByCreatedAtDesc();
        List<Review> revs = reviews.findAll();
        Map<Long, Review> bySub = revs.stream().collect(Collectors.toMap(r -> r.getSubmission().getId(), Function.identity()));

        List<ReportRow> rows = subs.stream().map(s -> {
            Review r = bySub.get(s.getId());
            return new ReportRow(s.getId(), r == null ? null : r.getId(), s.getTitle(), s.getStudent().getName(),
                    r == null ? null : r.getReviewer().getName(), r == null ? "UNASSIGNED" : r.getStatus().name(),
                    r == null ? 0 : (int) comments.countByReview_Id(r.getId()), r == null ? null : r.getScore());
        }).toList();

        List<Review> done = revs.stream().filter(r -> r.getStatus() == ReviewStatus.SUBMITTED).toList();
        Double avg = done.stream().filter(r -> r.getScore() != null)
                .mapToDouble(r -> r.getScore().doubleValue()).boxed()
                .collect(Collectors.averagingDouble(Double::doubleValue));
        if (done.stream().noneMatch(r -> r.getScore() != null)) avg = null;

        List<ParticipationRow> participation = students.stream().map(st -> new ParticipationRow(
                st.getName(), st.getEmail(),
                subs.stream().filter(s -> s.getStudent().getId().equals(st.getId())).count(),
                revs.stream().filter(r -> r.getReviewer().getId().equals(st.getId())).count(),
                done.stream().filter(r -> r.getReviewer().getId().equals(st.getId())).count())).toList();

        return new ReportResponse(students.size(), subs.size(), revs.size(), done.size(), avg, rows, participation);
    }
}
