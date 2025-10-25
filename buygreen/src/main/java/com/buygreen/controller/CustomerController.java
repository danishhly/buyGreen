package com.buygreen.controller;

import com.buygreen.model.Customers;
import com.buygreen.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
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
}
