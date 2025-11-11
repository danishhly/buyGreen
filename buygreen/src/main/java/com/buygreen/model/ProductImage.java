package com.buygreen.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "product_images")
public class ProductImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    @Column(name = "image_url", length = 1024, nullable = false)
    private String imageUrl;
    
    public ProductImage() {
    }
    
    public ProductImage(Long productId, String imageUrl) {
        this.productId = productId;
        this.imageUrl = imageUrl;
    }
}

