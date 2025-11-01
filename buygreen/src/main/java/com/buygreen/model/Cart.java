package com.buygreen.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
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

}
