package com.peerreview.service;

import com.peerreview.dto.Dtos.RegisterRequest;
import com.peerreview.exception.ApiException;
import com.peerreview.model.Student;
import com.peerreview.model.Teacher;
import com.peerreview.model.User;
import com.peerreview.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    @Test
    void instructorRegistrationCreatesUniqueClassroomCodeWithoutInviteCode() {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(users.existsByEmailIgnoreCase("teacher@example.edu")).thenReturn(false);
        when(users.findTeacherByClassroomCode(anyString())).thenReturn(Optional.empty());
        when(encoder.encode("password123")).thenReturn("encoded-password");
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registered = new AuthService(users, encoder, "").register(
                new RegisterRequest("Instructor", "teacher@example.edu", "password123", "TEACHER", null));

        Teacher teacher = assertInstanceOf(Teacher.class, registered);
        assertTrue(teacher.getClassroomCode().matches("[A-Z2-9]{8}"));
    }

    @Test
    void studentRegistrationJoinsInstructorUsingClassroomCode() {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        Teacher teacher = new Teacher("Instructor", "teacher@example.edu", "encoded-password", "ABCD2345");
        when(users.existsByEmailIgnoreCase("student@example.edu")).thenReturn(false);
        when(users.findTeacherByClassroomCode("ABCD2345")).thenReturn(Optional.of(teacher));
        when(encoder.encode("password123")).thenReturn("encoded-password");
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registered = new AuthService(users, encoder, "").register(
                new RegisterRequest("Student", "student@example.edu", "password123", "STUDENT", "ABCD2345"));

        Student student = assertInstanceOf(Student.class, registered);
        assertEquals(teacher, student.getTeacher());
    }

    @Test
    void studentRegistrationRejectsUnknownClassroomCode() {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(users.existsByEmailIgnoreCase("student@example.edu")).thenReturn(false);
        when(users.findTeacherByClassroomCode("UNKNOWN1")).thenReturn(Optional.empty());
        when(encoder.encode("password123")).thenReturn("encoded-password");

        ApiException error = assertThrows(ApiException.class, () -> new AuthService(users, encoder, "").register(
                new RegisterRequest("Student", "student@example.edu", "password123", "STUDENT", "UNKNOWN1")));

        assertEquals("Enter a valid instructor classroom code", error.getMessage());
    }
}
