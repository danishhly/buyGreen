package com.buygreen.controller;

import com.buygreen.dto.OrderRequest;
import com.buygreen.model.Order;
import com.buygreen.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<Order> placeOrder(@RequestBody OrderRequest orderRequest) {
        Order order = orderService.placeOrder(orderRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/customer/{customerId}")
    public List<Order> getOrders(@PathVariable Long customerId) {
        return orderService.getOrdersByCustomer(customerId);
    }
}

