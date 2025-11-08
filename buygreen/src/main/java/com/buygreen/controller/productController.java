package com.buygreen.controller;


import com.buygreen.model.Product;
import com.buygreen.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")

public class productController {

    @Autowired
    private ProductService service;

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(service.addProduct(product));
    }

    @GetMapping("/all")
    public ResponseEntity<Page<Product>> getAllProducts(Pageable pageable) {
        Page<Product> products = service.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product updated = service.updateProduct(id, product);
        return (updated != null)
                ? ResponseEntity.ok(updated)
                : ResponseEntity.badRequest().body("Product not found");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return ResponseEntity.ok(service.deleteProduct(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product product = service.getProductById(id);
        if(product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.badRequest().body("Product not found");
        }
    }
}
