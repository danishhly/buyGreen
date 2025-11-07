package com.buygreen.service;

import com.buygreen.model.Product;
import com.buygreen.model.Wishlist;
import com.buygreen.repository.ProductRepository;
import com.buygreen.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistServiceImpl implements WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public Wishlist addToWishlist(Long customerId, Long productId) {
        // check if its already there
        if(wishlistRepository.findByCustomerIdAndProductId(customerId, productId).isPresent()) {
            throw new IllegalStateException("Product already in wishlist");
        }
        //get product details to store a snapshot
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        //create and save the new wishlist item
        Wishlist wishlistItem = new Wishlist();
        wishlistItem.setCustomerId(customerId);
        wishlistItem.setProductId(productId);
        wishlistItem.setProductName(product.getName());
        wishlistItem.setProductImageUrl(String.valueOf(product.getImageUrls()));
        wishlistItem.setPrice(product.getPrice());

        return wishlistRepository.save(wishlistItem);
    }

    @Override
    @Transactional // use @Transactional for delete operation
    public void removeFromWishlist(Long customerId, Long productId) {
        wishlistRepository.deleteByCustomerIdAndProductId(customerId, productId);
    }
    @Override
    public List<Wishlist> getWishlist(Long customerId) {
        return wishlistRepository.findByCustomerId(customerId);
    }

    @Override
    public boolean isProductInWishList(Long customerId, Long productId) {
        return false;
    }

    @Override
    public boolean isProductInWishlist(Long customerId, Long productId) {
        return wishlistRepository.findByCustomerIdAndProductId(customerId, productId).isPresent();
    }
}
