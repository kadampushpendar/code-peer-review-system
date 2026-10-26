package com.peerreview.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "submissions")
public class CodeSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 30)
    private String language;

    @Column(name = "source_code", nullable = false, columnDefinition = "LONGTEXT")
    private String sourceCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected CodeSubmission() { }

    public CodeSubmission(User student, String title, String description, String language, String sourceCode) {
        this.student = student;
        this.title = title;
        this.description = description;
        this.language = language;
        this.sourceCode = sourceCode;
    }

    public void markReviewed() { this.status = SubmissionStatus.REVIEWED; }

    public Long getId() { return id; }
    public User getStudent() { return student; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLanguage() { return language; }
    public String getSourceCode() { return sourceCode; }
    public SubmissionStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
