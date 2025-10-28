package com.buygreen.service;


import com.buygreen.model.Product;
import com.buygreen.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl  implements ProductService{

    @Autowired
    private ProductRepository repo;

    @Override
    public Product addProduct(Product product) {
        return repo.save(product);
    }

    @Override
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    @Override
    public Product updateProduct(Long id, Product product) {
        Product existing = repo.findById(id).orElse(null);
        if(existing == null) return null;

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setImageUrl(product.getImageUrl());
        existing.setCategory(product.getCategory());
        existing.setStockQuantity(product.getStockQuantity());

        return repo.save(existing);
    }

    @Override
    public String deleteProduct(Long id) {
        if(repo.existsById(id)) {
            repo.deleteById(id);
            return "Product deleted successfully";
        }
        return "Product not found";
    }

}
