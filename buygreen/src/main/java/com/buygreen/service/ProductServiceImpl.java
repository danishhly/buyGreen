package com.buygreen.service;


import com.buygreen.model.Product;
import com.buygreen.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
public class ProductServiceImpl  implements ProductService{

    @Autowired
    private ProductRepository repo;

    @Override
    public Product addProduct(Product product) {
        Product saved = repo.save(product);
        // Update productImages with correct productId after save
        if (saved.getProductImages() != null && !saved.getProductImages().isEmpty()) {
            final Long productId = saved.getId();
            saved.getProductImages().forEach(img -> img.setProductId(productId));
            saved = repo.save(saved);
        }
        return saved;
    }

    @Override
    public Page<Product> getAllProducts(Pageable pageable) {
        return repo.findAll(pageable);
    }

    @Override
    public Product updateProduct(Long id, Product product) {
        Product existing = repo.findById(id).orElse(null);
        if(existing == null) return null;

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setImageUrls(product.getImageUrls());
        existing.setCategory(product.getCategory());
        existing.setStockQuantity(product.getStockQuantity());
        
        // Ensure productImages have correct productId
        if (existing.getProductImages() != null) {
            existing.getProductImages().forEach(img -> img.setProductId(id));
        }

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

    @Override
    public Product getProductById(Long id) {
        //findById returns an optioonal, so we use .orElse(null)
        return repo.findById(id).orElse(null);
    }

    @Override
    public Page<Product> searchProducts(String query, Pageable pageable){
        return repo.searchByNameOrDescription(query, pageable);
    }

}
