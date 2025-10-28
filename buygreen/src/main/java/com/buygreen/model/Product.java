package com.buygreen.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.autoconfigure.web.WebProperties;

import java.math.BigDecimal;


@Setter
@Getter
@Entity
@Table(name = "products")
    public class Product {

    public Product() {
        super();
    }


        @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

        private String name;
        private String description;
        private BigDecimal price;
        @Lob
        private String imageUrl;
        private int stockQuantity;
        private String category;

    public Product(String category, String description, Long id, String imageUrl, String name, BigDecimal price, int stockQuantity) {
        this.category = category;
        this.description = description;
        this.id = id;
        this.imageUrl = imageUrl;
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
    }

}

