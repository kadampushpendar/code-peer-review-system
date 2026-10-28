package com.peerreview.config;

import com.peerreview.model.Student;
import com.peerreview.model.Teacher;
import com.peerreview.model.User;
import com.peerreview.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductionDemoAccountsTest {

    @Test
    void seedsMissingProductionDemoAccountsWithEncodedPassword() throws Exception {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        List<User> savedUsers = new ArrayList<>();
        when(users.existsByEmailIgnoreCase("alice@university.edu")).thenReturn(false);
        when(users.existsByEmailIgnoreCase("bob@university.edu")).thenReturn(false);
        when(users.existsByEmailIgnoreCase("prof@university.edu")).thenReturn(false);
        when(encoder.encode("password123")).thenReturn("encoded-password");
        when(users.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            savedUsers.add(user);
            return user;
        });

        CommandLineRunner runner = new ProductionDemoAccounts().seedProductionDemoAccounts(users, encoder);
        runner.run();

        assertEquals(3, savedUsers.size());
        assertEquals(2, savedUsers.stream().filter(Student.class::isInstance).count());
        assertEquals(1, savedUsers.stream().filter(Teacher.class::isInstance).count());
        assertEquals(List.of("alice@university.edu", "bob@university.edu", "prof@university.edu"),
                savedUsers.stream().map(User::getEmail).toList());
        assertEquals(List.of("encoded-password"), savedUsers.stream().map(User::getPasswordHash).distinct().toList());
    }

    @Test
    void doesNotOverwriteExistingProductionAccounts() throws Exception {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(users.existsByEmailIgnoreCase("alice@university.edu")).thenReturn(true);
        when(users.existsByEmailIgnoreCase("bob@university.edu")).thenReturn(true);
        when(users.existsByEmailIgnoreCase("prof@university.edu")).thenReturn(true);

        CommandLineRunner runner = new ProductionDemoAccounts().seedProductionDemoAccounts(users, encoder);
        runner.run();

        verify(users, never()).save(any(User.class));
        verify(encoder).encode("password123");
    }
}
