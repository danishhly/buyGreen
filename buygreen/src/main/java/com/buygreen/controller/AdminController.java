package com.buygreen.controller;


import com.buygreen.model.Customers;
import com.buygreen.model.Order;
import com.buygreen.service.CustomerService;
import com.buygreen.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.security.Principal;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomerService customerService;

    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> getAllOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<Customers>> getAllCustomers(Pageable pageable) {
        Page<Customers> customers = customerService.getAllCustomers(pageable);
        customers.forEach(customer -> customer.setPassword(null));
        return ResponseEntity.ok(customers);
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id, Principal principal) {
        try {
            Customers customer = customerService.getCustomerById(id);
            if (customer == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Customer not found"));
            }
            
            // Prevent deleting yourself
            Customers currentAdmin = customerService.getCustomerByEmail(principal.getName());
            if (currentAdmin != null && currentAdmin.getId() == id) {
                return ResponseEntity.badRequest().body(Map.of("message", "You cannot delete your own account"));
            }
            
            customerService.deleteCustomer(id);
            String role = customer.getRole();
            String message = "admin".equalsIgnoreCase(role) 
                ? "Admin user deleted successfully" 
                : "Customer deleted successfully";
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete customer: " + e.getMessage()));
        }
    }
}
