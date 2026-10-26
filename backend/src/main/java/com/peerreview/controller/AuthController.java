package com.peerreview.controller;

import com.peerreview.dto.Dtos.RegisterRequest;
import com.peerreview.dto.Dtos.UserResponse;
import com.peerreview.service.AuthService;
import com.peerreview.service.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final CurrentUser current;

    public AuthController(AuthService auth, CurrentUser current) {
        this.auth = auth;
        this.current = current;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest req) {
        return UserResponse.of(auth.register(req));
    }

    /** The request is authenticated with HTTP Basic; reaching here means the credentials are valid. */
    @PostMapping("/login")
    public UserResponse login(Authentication authentication) {
        return UserResponse.of(current.of(authentication));
    }
}
