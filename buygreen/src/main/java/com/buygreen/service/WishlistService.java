package com.buygreen.service;

import com.buygreen.model.Wishlist;

import java.util.List;

public interface WishlistService {
    Wishlist addToWishlist(Long customerId, Long productId);
    void removeFromWishlist(Long customerId, Long productId);
    List<Wishlist> getWishlist(Long customerId);
    boolean isProductInWishList(Long customerId, Long productId);

    boolean isProductInWishlist(Long customerId, Long productId);
}
