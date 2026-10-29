package com.peerreview.service;

import com.peerreview.dto.Dtos.SubmissionRequest;
import com.peerreview.dto.Dtos.SubmissionResponse;
import com.peerreview.exception.ApiException;
import com.peerreview.model.CodeSubmission;
import com.peerreview.model.Review;
import com.peerreview.model.ReviewStatus;
import com.peerreview.model.Student;
import com.peerreview.model.Teacher;
import com.peerreview.model.User;
import com.peerreview.repository.ReviewRepository;
import com.peerreview.repository.SubmissionRepository;
import com.peerreview.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubmissionService {
    private final SubmissionRepository submissions;
    private final ReviewRepository reviews;
    private final UserRepository users;
    private final NotificationService notifications;
    private final ReviewMapper mapper;

    public SubmissionService(SubmissionRepository submissions, ReviewRepository reviews, UserRepository users,
                             NotificationService notifications, ReviewMapper mapper) {
        this.submissions = submissions;
        this.reviews = reviews;
        this.users = users;
        this.notifications = notifications;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> list(User me) {
        List<CodeSubmission> list = (me instanceof Teacher)
                ? submissions.findByTeacherIdOrderByCreatedAtDesc(me.getId())
                : submissions.findByStudent_IdOrderByCreatedAtDesc(me.getId());
        return list.stream().map(s -> mapper.submission(s, false)).toList();
    }

    @Transactional(readOnly = true)
    public SubmissionResponse get(Long id, User me) {
        CodeSubmission s = find(id);
        boolean owner = s.getStudent().getId().equals(me.getId());
        boolean reviewer = reviews.findBySubmission_Id(id)
                .map(r -> r.getReviewer().getId().equals(me.getId())).orElse(false);
        boolean teacherOwnsClass = me instanceof Teacher teacher
                && s.getStudent() instanceof Student student
                && student.getTeacher() != null
                && student.getTeacher().getId().equals(teacher.getId());
        if (!(me instanceof Teacher && teacherOwnsClass) && !(owner || reviewer)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You cannot view this submission");
        }
        return mapper.submission(s, true);
    }

    /** Saves the submission, then assigns the student with the lightest review load (never the author). */
    @Transactional
    public SubmissionResponse create(User author, SubmissionRequest req) {
        CodeSubmission s = submissions.save(new CodeSubmission(author, req.title().trim(),
                req.description() == null ? null : req.description().trim(), "JAVA", req.sourceCode()));
        pickReviewer(author).ifPresent(r -> assignReviewer(s, r));
        return mapper.submission(s, false);
    }

    @Transactional
    public SubmissionResponse assign(Long submissionId, Long reviewerId, User teacher) {
        CodeSubmission s = find(submissionId);
        if (s.getStudent() instanceof Student author && author.getTeacher() != null
                && !author.getTeacher().getId().equals(teacher.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You cannot assign reviews outside your classroom");
        }
        if (reviews.findBySubmission_Id(s.getId()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "This submission already has a reviewer");
        }
        Student reviewer = (reviewerId != null)
                ? users.findById(reviewerId).filter(u -> u instanceof Student)
                        .map(Student.class::cast)
                        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Reviewer must be an existing student"))
                : pickReviewer(s.getStudent())
                        .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "No other student is available to review"));
        ensureSameClass(s.getStudent(), reviewer);
        assignReviewer(s, reviewer);
        return mapper.submission(s, false);
    }

    private Optional<Student> pickReviewer(User author) {
        List<Student> candidates = author instanceof Student student && student.getTeacher() != null
                ? users.findStudentsByTeacherId(student.getTeacher().getId())
                : users.findAllStudents();
        return candidates.stream()
                .filter(st -> !st.getId().equals(author.getId()))
                .min(Comparator.comparingLong(st -> reviews.countByReviewer_IdAndStatus(st.getId(), ReviewStatus.IN_PROGRESS)));
    }

    private void ensureSameClass(User author, Student reviewer) {
        if (author instanceof Student student && student.getTeacher() != null
                && (reviewer.getTeacher() == null
                || !student.getTeacher().getId().equals(reviewer.getTeacher().getId()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Reviewer must belong to the same instructor classroom");
        }
    }

    private void assignReviewer(CodeSubmission s, User reviewer) {
        if (reviewer.getId().equals(s.getStudent().getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Students cannot review their own code");
        }
        reviews.save(new Review(s, reviewer));
        notifications.send(reviewer, s.getTitle() + " by " + s.getStudent().getName() + " was assigned to you for review.");
    }

    private CodeSubmission find(Long id) {
        return submissions.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Submission not found"));
    }
}
