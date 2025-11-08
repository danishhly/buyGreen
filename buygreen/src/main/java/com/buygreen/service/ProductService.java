package com.buygreen.service;

import com.buygreen.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

    public interface ProductService {
        Product addProduct(Product product);
        Page<Product> getAllProducts(Pageable pageable);
        Product updateProduct(Long id, Product product);
        String deleteProduct(Long id);
        Product getProductById(Long id);

        Page<Product> searchProducts(String query, Pageable pageable);
    }

