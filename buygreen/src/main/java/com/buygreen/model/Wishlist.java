package com.buygreen.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@Entity
@Table(name = "wishlist")
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private Long productId;

    //we store these details to make fetching the wishlist faster for the frontend
    private String productName;
    @Column(length = 1024)
    private String productImageUrl;
    private BigDecimal price;

    public Wishlist() {}

}
