package com.buygreen.controller;

import com.buygreen.dto.PaymentOrderRequest;
import com.buygreen.service.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/order")
    public ResponseEntity<?> createPaymentOrder(@RequestBody PaymentOrderRequest request) {
        try {
            Map<String, Object> order = paymentService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (RazorpayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                    "message", "Failed to initiate payment",
                    "details", ex.getMessage()
            ));
        }
    }
}
