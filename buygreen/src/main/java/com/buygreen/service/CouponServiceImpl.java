package com.buygreen.service;

import com.buygreen.model.Coupon;
import com.buygreen.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class CouponServiceImpl implements CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Override
    public Coupon validateCoupon(String code, BigDecimal orderTotal) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Coupon code is required");
        }

        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid coupon code"));

        if (!coupon.isValid()) {
            throw new IllegalArgumentException("This coupon is no longer valid");
        }

        if (orderTotal != null && coupon.getMinOrderAmount() != null) {
            if (orderTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
                throw new IllegalArgumentException(
                        String.format("Minimum order amount of ₹%.2f required for this coupon", 
                                coupon.getMinOrderAmount().doubleValue())
                );
            }
        }

        return coupon;
    }

    @Override
    @Transactional
    public Coupon applyCoupon(String code, BigDecimal orderTotal) {
        Coupon coupon = validateCoupon(code, orderTotal);
        
        // Increment usage count
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
        
        return coupon;
    }

    @Override
    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code.toUpperCase())
                .orElse(null);
    }
}

