package com.buygreen.controller;

import com.buygreen.dto.LoginData;
import com.buygreen.model.Customers;
import com.buygreen.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;


@RestController
public class CustomerController {

    @Autowired
    CustomerService service;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginData loginData) {
        Customers existingCustomer = service.getCustomerByEmail(loginData.getEmail());
        System.out.println(STR."Login request for email: \{loginData.getEmail()}");


        if (existingCustomer == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Users not found"));
        }

        if (!existingCustomer.getPassword().equals(loginData.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "invalid password"));

        }

        return ResponseEntity.ok(Map.of(
                "message", "Login Succesfull",
                "id", existingCustomer.getId(),
                "name", existingCustomer.getName(),
                "email", existingCustomer.getEmail(),
                "role", existingCustomer.getRole()
            ));
    }
}

