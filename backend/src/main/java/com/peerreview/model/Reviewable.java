package com.peerreview.model;

/** INTERFACE: the contract every review must follow. */
public interface Reviewable {
    void addFeedback(String feedback);
    void submitReview();
}
