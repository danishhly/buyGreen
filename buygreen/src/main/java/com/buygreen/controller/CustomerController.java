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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import java.security.Principal;
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