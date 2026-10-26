package com.peerreview.service;

import com.peerreview.dto.Dtos.RegisterRequest;
import com.peerreview.exception.ApiException;
import com.peerreview.model.Student;
import com.peerreview.model.Teacher;
import com.peerreview.model.User;
import com.peerreview.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String teacherCode;
    private final String emailDomain;

    public AuthService(UserRepository users, PasswordEncoder encoder,
                       @Value("${app.teacher-code}") String teacherCode,
                       @Value("${app.email-domain:}") String emailDomain) {
        this.users = users;
        this.encoder = encoder;
        this.teacherCode = teacherCode;
        this.emailDomain = emailDomain.trim().toLowerCase();
    }

    @Transactional
    public User register(RegisterRequest r) {
        String email = r.email().trim().toLowerCase();
        if (!emailDomain.isEmpty() && !email.endsWith("@" + emailDomain)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Use your @" + emailDomain + " email address");
        }
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "That email is already registered");
        }
        String hash = encoder.encode(r.password());
        String name = r.name().trim();
        if (r.role().equals("TEACHER")) {
            if (!codeMatches(r.teacherCode())) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Invalid teacher invite code");
            }
            return users.save(new Teacher(name, email, hash));
        }
        return users.save(new Student(name, email, hash));
    }

    private boolean codeMatches(String given) {
        if (given == null) return false;
        return MessageDigest.isEqual(given.getBytes(StandardCharsets.UTF_8), teacherCode.getBytes(StandardCharsets.UTF_8));
    }
}
