package com.buygreen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Health check endpoint for monitoring services
 * This endpoint can be pinged by uptime monitoring services to keep the app active
 */
@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "service", "BuyGreen API",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "BuyGreen API",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> apiHealth() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "BuyGreen API",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}

