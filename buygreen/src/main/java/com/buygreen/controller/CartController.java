package com.buygreen.controller;


import com.buygreen.model.Cart;
import com.buygreen.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    @Autowired
    private CartService service;

    @PostMapping("/add")
    public String addToCart(@RequestBody Cart cart) {
        return service.addToCart(cart);
    }

    @GetMapping("/{customerId}")
    public List<Cart> getCartItems(@PathVariable Long customerId) {
        return service.getCartItems(customerId);
    }

    @DeleteMapping("/{id}")
    public void removedFromCart(@PathVariable Long id) {
        service.removeFromCart(id);
    }
}
