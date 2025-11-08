package com.buygreen.controller;


import com.buygreen.model.Coupon;
import com.buygreen.model.Customers;
import com.buygreen.model.Order;
import com.buygreen.repository.CouponRepository;
import com.buygreen.service.CouponService;
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
    
    @Autowired
    private CouponService couponService;
    
    @Autowired
    private CouponRepository couponRepository;

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

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
            }

            Order.OrderStatus newStatus;
            try {
                newStatus = Order.OrderStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid status. Valid values: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED"));
            }

            Order updatedOrder = orderService.updateOrderStatus(orderId, newStatus);
            return ResponseEntity.ok(Map.of(
                    "message", "Order status updated successfully",
                    "order", updatedOrder
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update order status: " + e.getMessage()));
        }
    }

    // Coupon Management Endpoints
    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        List<Coupon> coupons = couponRepository.findAll();
        return ResponseEntity.ok(coupons);
    }

    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            // Validate coupon code uniqueness
            if (couponRepository.findByCode(coupon.getCode().toUpperCase()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Coupon code already exists"));
            }
            
            coupon.setCode(coupon.getCode().toUpperCase());
            Coupon savedCoupon = couponRepository.save(coupon);
            return ResponseEntity.ok(savedCoupon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create coupon: " + e.getMessage()));
        }
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        try {
            Coupon existingCoupon = couponRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
            
            // Check if code is being changed and if new code already exists
            if (!existingCoupon.getCode().equalsIgnoreCase(coupon.getCode())) {
                if (couponRepository.findByCode(coupon.getCode().toUpperCase()).isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Coupon code already exists"));
                }
            }
            
            coupon.setId(id);
            coupon.setCode(coupon.getCode().toUpperCase());
            Coupon updatedCoupon = couponRepository.save(coupon);
            return ResponseEntity.ok(updatedCoupon);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update coupon: " + e.getMessage()));
        }
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            if (!couponRepository.existsById(id)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Coupon not found"));
            }
            couponRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete coupon: " + e.getMessage()));
        }
    }
}
