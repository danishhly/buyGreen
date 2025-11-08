package com.buygreen.controller;

import com.buygreen.model.Coupon;
import com.buygreen.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            String orderTotalStr = request.get("orderTotal");
            
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Coupon code is required"));
            }

            BigDecimal orderTotal = orderTotalStr != null ? new BigDecimal(orderTotalStr) : BigDecimal.ZERO;
            Coupon coupon = couponService.validateCoupon(code, orderTotal);
            
            BigDecimal discount = coupon.calculateDiscount(orderTotal);
            BigDecimal finalAmount = orderTotal.subtract(discount);

            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "coupon", Map.of(
                            "code", coupon.getCode(),
                            "discountType", coupon.getDiscountType().toString(),
                            "discountValue", coupon.getDiscountValue()
                    ),
                    "discount", discount,
                    "finalAmount", finalAmount,
                    "message", "Coupon applied successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", "Error validating coupon: " + e.getMessage()
            ));
        }
    }
}

