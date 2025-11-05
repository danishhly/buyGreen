package com.buygreen.service;

import com.buygreen.model.Product;

import java.util.List;

    public interface ProductService {
        Product addProduct(Product product);
        List<Product> getAllProducts();
        Product updateProduct(Long id, Product product);
        String deleteProduct(Long id);
        Product getProductById(Long id);
    }

