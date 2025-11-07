package com.buygreen.controller;


import com.buygreen.model.Customers;
import com.buygreen.model.Order;
import com.buygreen.service.CustomerService;
import com.buygreen.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomerService customerService;

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<Customers>> getAllCustomers() {
        List<Customers> customers = customerService.getAllCustomers();
        customers.forEach(customer -> customer.setPassword(null));
        return ResponseEntity.ok(customers);
    }
}
