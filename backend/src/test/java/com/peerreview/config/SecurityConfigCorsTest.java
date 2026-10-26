package com.peerreview.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class SecurityConfigCorsTest {

    @Test
    void allowsConfiguredPublicTunnelOriginAndRejectsOtherOrigins() {
        String publicOrigin = "https://shades-dates-object-quantitative.trycloudflare.com";
        CorsConfiguration cors = new SecurityConfig()
                .corsConfigurationSource("http://localhost:5173," + publicOrigin)
                .getCorsConfiguration(new MockHttpServletRequest("POST", "/api/auth/login"));

        assertEquals(publicOrigin, cors.checkOrigin(publicOrigin));
        assertNull(cors.checkOrigin("https://unrelated.example.com"));
        assertEquals("http://127.0.0.1:5173", cors.checkOrigin("http://127.0.0.1:5173"));
    }
}
