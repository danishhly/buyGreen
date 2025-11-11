package com.buygreen.controller;

import com.buygreen.dto.OrderRequest;
import com.buygreen.model.Order;
import com.buygreen.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest orderRequest) {
        try {
            // Validate request
            if (orderRequest == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Order request cannot be null"));
            }
            if (orderRequest.getCustomerId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Customer ID is required"));
            }
            if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Order must contain at least one item"));
            }
            if (orderRequest.getTotalAmount() == null || orderRequest.getTotalAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Total amount must be greater than zero"));
            }
            
            Order order = orderService.placeOrder(orderRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to place order: " + e.getMessage()));
        }
    }

    @GetMapping("/customer/{customerId}")
    public List<Order> getOrders(@PathVariable Long customerId) {
        return orderService.getOrdersByCustomer(customerId);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

