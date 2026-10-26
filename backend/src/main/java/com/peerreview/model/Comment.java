package com.peerreview.model;

import jakarta.persistence.*;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "review_id")
    private Review review;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity = Severity.SUGGESTION;

    protected Comment() { }

    public Comment(Review review, Integer lineNumber, String commentText, Severity severity) {
        this.review = review;
        this.lineNumber = lineNumber;
        this.commentText = commentText;
        this.severity = severity;
    }

    public Long getId() { return id; }
    public Review getReview() { return review; }
    public Integer getLineNumber() { return lineNumber; }
    public String getCommentText() { return commentText; }
    public Severity getSeverity() { return severity; }
}
