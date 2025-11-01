package com.buygreen.service;


import com.buygreen.model.Cart;

import java.util.List;

public interface CartService {
    String addToCart(Cart cart);
    List<Cart> getCartItems(Long customerId);
    void removeFromCart(Long id);
    Cart decrementItem(Long customerId, Long productId);
    void clearCartByCustomerId(Long customerId);
}
