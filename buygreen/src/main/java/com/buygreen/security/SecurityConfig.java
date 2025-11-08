package com.buygreen.security;

import org.springframework.beans.factory.annotation.Autowired; // <-- IMPORT THIS
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // <-- IMPORT THIS

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

    // --- 1. INJECT THE FILTER ---
    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults()) // Use global WebConfig CORS
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for stateless API

                // --- 2. CONFIGURE STRICTER RULES ---
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication needed)
                        .requestMatchers("/login").permitAll()
                        .requestMatchers("/signup").permitAll()
                        .requestMatchers("/auth/google").permitAll()
                        .requestMatchers("/forgot-password").permitAll()
                        .requestMatchers("/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/all").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/{id}").permitAll()

                        //Add review files
                        .requestMatchers(HttpMethod.GET, "/products/{productId}/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/{productId}/reviews/check").permitAll()
                        .requestMatchers(HttpMethod.POST, "/products/{productId}/reviews").permitAll()

                        // Admin-only endpoints
                        .requestMatchers("/products/add").hasRole("ADMIN")
                        .requestMatchers("/products/update/**").hasRole("ADMIN")
                        .requestMatchers("/products/delete/**").hasRole("ADMIN")
                        .requestMatchers("/AdminDashboard").hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // Customer/User endpoints (must be logged in)
                        .requestMatchers("/customers/change-password").authenticated()
                        .requestMatchers("/cart/**").authenticated()
                        .requestMatchers("/orders/**").authenticated()
                        .requestMatchers("/payments/**").authenticated()
                        .requestMatchers("/wishlist/**").authenticated() // <-- SECURE NEW ENDPOINT

                        // Deny all other requests by default
                        .anyRequest().authenticated()
                )
                // Make the session stateless
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        // --- 3. ADD THE JWT FILTER ---
        // This tells Spring Security to use our filter to check for JWTs
        // on every request before it tries to authenticate with username/password.
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}