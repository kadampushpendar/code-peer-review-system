package com.peerreview.config;

import com.peerreview.model.Student;
import com.peerreview.model.Teacher;
import com.peerreview.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("prod")
public class ProductionDemoAccounts {
    private static final Logger log = LoggerFactory.getLogger(ProductionDemoAccounts.class);

    @Bean
    public CommandLineRunner seedProductionDemoAccounts(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            String hash = encoder.encode("password123");
            boolean created = false;

            if (!users.existsByEmailIgnoreCase("alice@university.edu")) {
                users.save(new Student("Alice Walker", "alice@university.edu", hash));
                created = true;
            }
            if (!users.existsByEmailIgnoreCase("bob@university.edu")) {
                users.save(new Student("Bob Jones", "bob@university.edu", hash));
                created = true;
            }
            if (!users.existsByEmailIgnoreCase("prof@university.edu")) {
                users.save(new Teacher("Prof. Davis", "prof@university.edu", hash));
                created = true;
            }

            if (created) {
                log.warn("Production demo accounts are enabled with public credentials; users can modify application data.");
            }
        };
    }
}
