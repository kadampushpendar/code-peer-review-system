package com.peerreview.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(c -> c.disable()) // stateless API: credentials are sent in a header, not a cookie
            .headers(h -> h.frameOptions(f -> f.sameOrigin()))
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/teacher/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.POST, "/api/submissions").hasRole("STUDENT")
                .requestMatchers(HttpMethod.POST, "/api/submissions/*/assign").hasRole("TEACHER")
                .anyRequest().authenticated())
            // Custom entry point: return JSON 401 without the header that makes browsers show a login popup.
            .httpBasic(b -> b.authenticationEntryPoint((req, res, ex) -> {
                res.setStatus(401);
                res.setContentType("application/json");
                res.getWriter().write("{\"message\":\"Invalid email or password\"}");
            }));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.origin}") String origin) {
        CorsConfiguration c = new CorsConfiguration();
        List<String> origins = Arrays.stream(origin.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toList());
        if (origins.contains("http://localhost:5173") && !origins.contains("http://127.0.0.1:5173")) {
            origins.add("http://127.0.0.1:5173");
        }
        c.setAllowedOrigins(origins);
        c.setAllowedMethods(List.of("GET", "POST", "PATCH", "OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", c);
        return source;
    }
}
