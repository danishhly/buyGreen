package com.buygreen.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults()) // Use global WebConfig CORS
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for stateless API

                // --- THIS IS THE NEW PART ---
                // Set up authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication needed)
                        .requestMatchers("/login").permitAll()
                        .requestMatchers("/signup").permitAll()
                        .requestMatchers("/auth/google").permitAll()
                        .requestMatchers("/forgot-password").permitAll()
                        .requestMatchers("/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/all").permitAll() // Anyone can view products
                        .requestMatchers(HttpMethod.GET, "/products/{id}").permitAll() // Anyone can view one product

                        // Admin-only endpoints
                        .requestMatchers("/products/add").hasRole("ADMIN")
                        .requestMatchers("/products/update/**").hasRole("ADMIN")
                        .requestMatchers("/products/delete/**").hasRole("ADMIN")
                        .requestMatchers("/AdminDashboard").hasRole("ADMIN") // Just in case

                        // Temporarily public API endpoints used by the SPA
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/cart/**").permitAll()
                        .requestMatchers("/orders/**").permitAll()
                        .requestMatchers("/payments/**").permitAll()

                        // Temporarily allow all requests (remove when JWT auth is implemented)
                        .anyRequest().permitAll()
                )
                // Make the session stateless
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }
}