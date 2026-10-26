package com.peerreview;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.WebApplicationType;

@SpringBootApplication
public class PeerReviewApplication {
    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(PeerReviewApplication.class);
        for (String argument : args) {
            if ("--app.migrate-h2-to-mysql=true".equals(argument)) {
                application.setWebApplicationType(WebApplicationType.NONE);
                break;
            }
        }
        application.run(args);
    }
}
