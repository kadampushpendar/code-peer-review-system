package com.peerreview.config;

import com.peerreview.model.Student;
import com.peerreview.model.Teacher;
import com.peerreview.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (users.count() == 0) {
                log.info("Seeding default demo accounts for local development...");
                String hash = encoder.encode("password123");
                users.save(new Student("Alice Walker", "alice@university.edu", hash));
                users.save(new Student("Bob Jones", "bob@university.edu", hash));
                users.save(new Teacher("Prof. Davis", "prof@university.edu", hash));
                log.info("Demo accounts created: alice@university.edu, bob@university.edu, prof@university.edu (password: password123)");
            }
        };
    }
}
