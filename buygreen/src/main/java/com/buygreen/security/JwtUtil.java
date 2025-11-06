package com.buygreen.security;

import com.buygreen.model.Customers;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Token valid for 10 hours
    public static final long JWT_TOKEN_VALIDITY = 10 * 60 * 60;

    private final SecretKey secretKey;

    // 1. Load the secret key from application.properties
    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // 2. Create a new token for a user
    public String generateToken(Customers customer) {
        Map<String, Object> claims = new HashMap<>();
        // Add custom claims (like role)
        claims.put("role", customer.getRole());
        claims.put("name", customer.getName());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(customer.getEmail()) // The user's email
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // 3. Get the username (email) from the token
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    // 4. Check if the token is expired
    public Boolean isTokenExpired(String token) {
        final Date expiration = getClaimFromToken(token, Claims::getExpiration);
        return expiration.before(new Date());
    }

    // 5. Validate the token
    public Boolean validateToken(String token, Customers customer) {
        final String username = getUsernameFromToken(token);
        return (username.equals(customer.getEmail()) && !isTokenExpired(token));
    }

    // Helper function to get any claim
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}