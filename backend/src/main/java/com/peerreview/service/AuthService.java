package com.peerreview.service;

import com.peerreview.dto.Dtos.RegisterRequest;
import com.peerreview.exception.ApiException;
import com.peerreview.model.Student;
import com.peerreview.model.Teacher;
import com.peerreview.model.User;
import com.peerreview.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String emailDomain;

    public AuthService(UserRepository users, PasswordEncoder encoder,
                       @Value("${app.email-domain:}") String emailDomain) {
        this.users = users;
        this.encoder = encoder;
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
            return users.save(new Teacher(name, email, hash, newUniqueClassroomCode()));
        }
        String classroomCode = r.classroomCode() == null ? "" : r.classroomCode().trim();
        Teacher teacher = users.findTeacherByClassroomCode(classroomCode)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Enter a valid instructor classroom code"));
        return users.save(new Student(name, email, hash, teacher));
    }

    @Transactional
    public User ensureClassroomCode(User user) {
        if (user instanceof Teacher teacher && teacher.getClassroomCode() == null) {
            teacher.assignClassroomCode(newUniqueClassroomCode());
            return users.save(teacher);
        }
        return user;
    }

    private String newUniqueClassroomCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String code = Teacher.generateClassroomCode();
            if (users.findTeacherByClassroomCode(code).isEmpty()) {
                return code;
            }
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create an instructor classroom code");
    }
}
