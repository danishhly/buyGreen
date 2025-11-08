package com.buygreen.controller;

import com.buygreen.dto.PasswordChangedDto;
import com.buygreen.dto.TokenDto;
import com.buygreen.dto.LoginData;
import com.buygreen.model.Customers;
import com.buygreen.security.JwtUtil;
import com.buygreen.service.CustomerService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
// 1. FIXED: Use the correct @Value import
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import java.security.Principal;
import com.buygreen.dto.ForgotPasswordDto;
import com.buygreen.dto.ResetPasswordDto;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Map;

// 2. NOTE: I've removed the @CrossOrigin here since you have a global WebConfig.
//    (Based on the files you've provided before)
@RestController
public class CustomerController {

    @Autowired
    CustomerService service;

    //inject the encoder
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ADD THESE TWO DTOs (or create new files for them like PasswordChangeDto)
    static class ForgotPasswordDto {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    static class ResetPasswordDto {
        private String token;
        private String newPassword;
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    // --- ADD NEW ENDPOINT 1 ---
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordDto forgotDto) {
        service.createPasswordResetToken(forgotDto.getEmail());
        // Always return success to prevent email enumeration attacks
        return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent."));
    }

    // --- ADD NEW ENDPOINT 2 ---
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDto resetDto) {
        boolean isReset = service.resetPassword(resetDto.getToken(), resetDto.getNewPassword());
        if (isReset) {
            return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token."));
        }
    }


    // 3. FIXED: Correctly injecting the Google Client ID
    @Value("${google.clientId}")
    private String GOOGLE_CLIENT_ID;

    // 4. REMOVED: Unnecessary field 'private TokenDto tokenDto;'

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody Customers customer) {
        System.out.println("Signup Request: " + customer);
        String result = service.addCustomer(customer);

        if (result.equals("success")) {
            return ResponseEntity.ok(Map.of("message", "signup successful"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already Exist"));
        }
    }

    @PostMapping("/customers/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangedDto passwordDto, Principal principal) {

        // 'Principal' securely gets the logged-in user's name (which is their email in our case)
        String userEmail = principal.getName();

        boolean isChanged = service.changePassword(
                userEmail,
                passwordDto.getOldPassword(),
                passwordDto.getNewPassword()
        );

        if (isChanged) {
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid old password"));
        }
    }

    @PutMapping("/customers/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Customers updatedCustomer, Principal principal) {
        String userEmail = principal.getName();
        
        Customers updated = service.updateProfile(userEmail, updatedCustomer);
        
        if (updated != null) {
            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "customer", Map.of(
                    "id", updated.getId(),
                    "name", updated.getName(),
                    "email", updated.getEmail(),
                    "phone", updated.getPhone() != null ? updated.getPhone() : "",
                    "address", updated.getAddress() != null ? updated.getAddress() : "",
                    "role", updated.getRole()
                )
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update profile"));
        }
    }

    @PostMapping("/customers/change-email")
    public ResponseEntity<?> changeEmail(@RequestBody Map<String, String> request, Principal principal) {
        String userEmail = principal.getName();
        String newEmail = request.get("newEmail");
        String password = request.get("password");

        if (newEmail == null || newEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "New email is required"));
        }

        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }

        // Validate email format
        if (!newEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email format"));
        }

        // Check if new email is same as current
        if (userEmail.equalsIgnoreCase(newEmail)) {
            return ResponseEntity.badRequest().body(Map.of("message", "New email must be different from current email"));
        }

        boolean isChanged = service.changeEmail(userEmail, newEmail, password);
        
        if (isChanged) {
            // Generate new token with updated email
            Customers updatedCustomer = service.getCustomerByEmail(newEmail);
            final String token = jwtUtil.generateToken(updatedCustomer);
            
            return ResponseEntity.ok(Map.of(
                "message", "Email changed successfully. Please login again with your new email.",
                "token", token,
                "customer", Map.of(
                    "id", updatedCustomer.getId(),
                    "name", updatedCustomer.getName(),
                    "email", updatedCustomer.getEmail(),
                    "role", updatedCustomer.getRole()
                )
            ));
        } else {
            Customers existingCustomer = service.getCustomerByEmail(newEmail);
            if (existingCustomer != null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid password"));
            }
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginData loginData) {
        Customers existingCustomer = service.getCustomerByEmail(loginData.getEmail());
        System.out.println(STR."Login request for email: \{loginData.getEmail()}");

        if (existingCustomer == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Users not found"));
        }
//            no longer need to  use .equals() for the password.
        //    used passwordEncoder.matches() to securely compare them.
//        if (!existingCustomer.getPassword().equals(loginData.getPassword())) {
//            return ResponseEntity.badRequest().body(Map.of("message", "invalid password"));
//        }

        if(!passwordEncoder.matches(loginData.getPassword(), existingCustomer.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "invalid password"));
        }

        final String token = jwtUtil.generateToken(existingCustomer);

        return ResponseEntity.ok(Map.of(
                "message", "Login Succesfull",
                "token", token,
                "customer", Map.of(
                        "id", existingCustomer.getId(),
                        "name", existingCustomer.getName(),
                        "email",existingCustomer.getEmail(),
                        "role",existingCustomer.getRole()
                )
        ));
    }

    // 6. FIXED: The googleLogin method is now a separate method in the class.
    @PostMapping("/auth/google")
    public ResponseEntity<?> googleLogin(@RequestBody TokenDto tokenDto) {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new JacksonFactory())
                .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                .build();

        GoogleIdToken idToken;
        try {
            // Verify the token
            idToken = verifier.verify(tokenDto.getToken());
        } catch (GeneralSecurityException | IOException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid Google token"));
        }

        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            // Get or create the customer
            Customers customer = service.processGoogleUser(email, name);

            final String token = jwtUtil.generateToken(customer);
            // 7. FIXED: Return the details for the customer from 'processGoogleUser'
            return ResponseEntity.ok(Map.of(
                    "message", "Login Successful",
                    "token", token,
                    "customer", Map.of(
                    "id", customer.getId(),
                    "name", customer.getName(),
                    "email", customer.getEmail(),
                    "role", customer.getRole()
                    )
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid Google Token"));
        }
    }
}