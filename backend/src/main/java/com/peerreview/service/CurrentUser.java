package com.peerreview.service;

import com.peerreview.exception.ApiException;
import com.peerreview.model.User;
import com.peerreview.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {
    private final UserRepository users;

    public CurrentUser(UserRepository users) {
        this.users = users;
    }

    public User of(Authentication auth) {
        return users.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again"));
    }
}
