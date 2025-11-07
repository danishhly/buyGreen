package com.buygreen.controller;


import com.buygreen.dto.WishlistRequestDto;
import com.buygreen.model.Customers;
import com.buygreen.model.Wishlist;
import com.buygreen.service.CustomerService;
import com.buygreen.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private CustomerService customerService; //to find customer Id from eamil principal
    /**
     * Helper method to get the customer ID from the authenticated Principal.
     */
    private Long getCustomerIdFromPrincipal(Principal principal) {
        String email = principal.getName(); //this comes from JWT
        Customers customer = customerService.getCustomerByEmail(email);
        if(customer == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        return customer.getId();
    }
    /**
     * Get all wishlist items for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<Wishlist>> getWishlist(Principal principal) {
        Long customerId = getCustomerIdFromPrincipal(principal);
        return ResponseEntity.ok(wishlistService.getWishlist(customerId));
    }
    /**
     * Add a product to the logged-in user's wishlist.
     */
    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@RequestBody WishlistRequestDto requestDto, Principal principal) {
        Long customerId = getCustomerIdFromPrincipal(principal);
        try{
            Wishlist item = wishlistService.addToWishlist(customerId, requestDto.getProductId());
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    /**
     * Remove a product from the logged-in user's wishlist.
     */
    @PostMapping("/remove")
    public ResponseEntity<?> removeFromWishlist(@RequestBody WishlistRequestDto requestDto, Principal principal) {
        Long customerId = getCustomerIdFromPrincipal(principal);
        try {
            wishlistService.removeFromWishlist(customerId, requestDto.getProductId());
            return ResponseEntity.ok(Map.of("message", "Item removed from wishlist"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    /**
     * Check if a specific product is in the user's wishlist.
     * Useful for the product details page.
     */
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlist(@PathVariable Long productId, Principal principal) {
        // If user is not logged in, it's definitely not in their wishlist
        if(principal == null) {
            return ResponseEntity.ok(Map.of("inWishList", false));
        }
        Long customerId = getCustomerIdFromPrincipal(principal);
        boolean inWishList = wishlistService.isProductInWishList(customerId, productId);
        return ResponseEntity.ok(Map.of("inWishList", inWishList));
    }
}
