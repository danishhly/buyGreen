package com.buygreen.model;


import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cart")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    private Long customerId;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private int quantity;

    public Cart() {}

    public Cart(Long customerId, Long id, BigDecimal price, Long productId, String productName, int quantity) {
        this.customerId = customerId;
        this.id = id;
        this.price = price;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
