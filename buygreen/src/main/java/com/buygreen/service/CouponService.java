package com.buygreen.service;

import com.buygreen.model.Coupon;
import java.math.BigDecimal;

public interface CouponService {
    Coupon validateCoupon(String code, BigDecimal orderTotal);
    Coupon applyCoupon(String code, BigDecimal orderTotal);
    Coupon getCouponByCode(String code);
}

