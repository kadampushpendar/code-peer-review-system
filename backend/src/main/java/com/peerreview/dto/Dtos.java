package com.peerreview.dto;

import com.peerreview.model.Notification;
import com.peerreview.model.Severity;
import com.peerreview.model.User;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Request and response shapes for the REST API. */
public final class Dtos {
    private Dtos() { }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            @NotBlank @Pattern(regexp = "STUDENT|TEACHER", message = "Role must be STUDENT or TEACHER") String role,
            String teacherCode) { }

    public record UserResponse(Long id, String name, String email, String role) {
        public static UserResponse of(User u) {
            return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole());
        }
    }

    public record SubmissionRequest(
            @NotBlank @Size(max = 200) String title,
            @Size(max = 500) String description,
            @NotBlank @Size(min = 10, max = 50000) String sourceCode) { }

    public record SubmissionResponse(Long id, String title, String description, String language, String sourceCode,
                                     String status, Instant createdAt, Long studentId, String studentName,
                                     Long reviewId, String reviewerName, String reviewStatus, int commentCount) { }

    public record CommentRequest(
            @NotNull @Min(1) Integer lineNumber,
            @NotBlank @Size(max = 1000) String commentText,
            @NotNull Severity severity) { }

    public record CommentResponse(Long id, Integer lineNumber, String commentText, Severity severity) { }

    public record ReviewSubmitRequest(
            @NotBlank @Size(max = 5000) String feedback,
            @NotNull @DecimalMin("0") @DecimalMax("10") BigDecimal score) { }

    public record ReviewResponse(Long id, Long submissionId, String title, String description, String sourceCode,
                                 Long authorId, String authorName, Long reviewerId, String reviewerName,
                                 String status, String feedback, BigDecimal score, Instant completedAt,
                                 List<CommentResponse> comments) { }

    public record NotificationResponse(Long id, String message, boolean read, Instant createdAt) {
        public static NotificationResponse of(Notification n) {
            return new NotificationResponse(n.getId(), n.getMessage(), n.isRead(), n.getCreatedAt());
        }
    }

    public record ReportRow(Long submissionId, Long reviewId, String title, String author, String reviewer,
                            String status, int commentCount, BigDecimal score) { }

    public record ParticipationRow(String name, String email, long submitted, long reviewsAssigned, long reviewsDone) { }

    public record ReportResponse(long students, long submissions, long reviewsTotal, long reviewsCompleted,
                                 Double averageScore, List<ReportRow> rows, List<ParticipationRow> participation) { }
}
