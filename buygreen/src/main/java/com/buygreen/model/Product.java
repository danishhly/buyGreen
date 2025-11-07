package com.buygreen.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;


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
        @ElementCollection(fetch = FetchType.EAGER) // store a collection of basic strings
        @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
        @Column(name= "image_url", length= 1024) // Column name for the URLS

        @Lob
        private List<String> imageUrls;
        private int stockQuantity;
        private String category;

}

