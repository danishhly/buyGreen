package com.buygreen.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    private BigDecimal discountValue; // Percentage (0-100) or fixed amount

    private BigDecimal minOrderAmount; // Minimum order amount to use this coupon

    private BigDecimal maxDiscount; // Maximum discount amount (for percentage coupons)

    private LocalDateTime expiryDate;

    private Integer usageLimit; // Total number of times this coupon can be used

    private Integer usedCount = 0; // Number of times this coupon has been used

    private Boolean isActive = true;

    public enum DiscountType {
        PERCENTAGE,
        FIXED
    }

    public Coupon() {
    }

    /**
     * Calculate discount amount for a given order total
     */
    public BigDecimal calculateDiscount(BigDecimal orderTotal) {
        if (orderTotal.compareTo(minOrderAmount) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if (discountType == DiscountType.PERCENTAGE) {
            discount = orderTotal.multiply(discountValue).divide(BigDecimal.valueOf(100));
            if (maxDiscount != null && discount.compareTo(maxDiscount) > 0) {
                discount = maxDiscount;
            }
        } else {
            discount = discountValue;
            // Fixed discount cannot exceed order total
            if (discount.compareTo(orderTotal) > 0) {
                discount = orderTotal;
            }
        }

        return discount;
    }

    /**
     * Check if coupon is valid for use
     */
    public boolean isValid() {
        if (!isActive) {
            return false;
        }

        if (expiryDate != null && LocalDateTime.now().isAfter(expiryDate)) {
            return false;
        }

        if (usageLimit != null && usedCount >= usageLimit) {
            return false;
        }

        return true;
    }
}

