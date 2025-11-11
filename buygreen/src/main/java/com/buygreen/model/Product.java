package com.buygreen.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;


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
        
        @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        @JoinColumn(name = "product_id")
        private List<ProductImage> productImages;
        
        // Keep imageUrls for backward compatibility (computed property)
        @Transient
        private List<String> imageUrls;
        
        private int stockQuantity;
        private String category;
        
        // Getter for imageUrls (computed from productImages)
        public List<String> getImageUrls() {
            if (productImages != null) {
                return productImages.stream()
                    .map(ProductImage::getImageUrl)
                    .toList();
            }
            return imageUrls != null ? imageUrls : List.of();
        }
        
        // Setter for imageUrls (converts to productImages)
        public void setImageUrls(List<String> urls) {
            this.imageUrls = urls;
            if (urls != null && !urls.isEmpty()) {
                if (this.productImages == null) {
                    this.productImages = new ArrayList<>();
                } else {
                    this.productImages.clear();
                }
                for (String url : urls) {
                    ProductImage img = new ProductImage();
                    img.setProductId(this.id);
                    img.setImageUrl(url);
                    this.productImages.add(img);
                }
            } else {
                if (this.productImages != null) {
                    this.productImages.clear();
                }
            }
        }

}

