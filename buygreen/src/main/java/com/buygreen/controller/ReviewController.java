package com.buygreen.controller;

import com.buygreen.model.Customers;
import com.buygreen.model.Review;
import com.buygreen.repository.ReviewRepository;
import com.buygreen.service.CustomerService;
import com.buygreen.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products/{productId}/reviews") // Base path is nested under products
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomerService customerService;

    /**
     * Helper method to get the customer ID from the authenticated Principal.
     */
    private Customers getCustomerFromPrincipal(Principal principal) {
        String email = principal.getName();
        Customers customer = customerService.getCustomerByEmail(email);
        if (customer == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        return customer;
    }

    /**
     * GET /products/{productId}/reviews
     * Gets all reviews for a specific product. This is a PUBLIC endpoint.
     */
    @GetMapping
    public ResponseEntity<List<Review>> getReviewsForProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByReviewDateDesc(productId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * POST /products/{productId}/reviews
     * Creates a new review for a product. This is a SECURE endpoint.
     */
    @PostMapping
    public ResponseEntity<?> createReview(@PathVariable Long productId, @RequestBody Review reviewRequest, Principal principal) {

        Customers customer = getCustomerFromPrincipal(principal);

        // 1. Check if user has purchased this item
        boolean hasPurchased = orderService.hasCustomerPurchasedProduct(customer.getId(), productId);
        if (!hasPurchased) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only review products you have purchased."));
        }

        // 2. Check if user has already reviewed this item
        boolean hasReviewed = reviewRepository.existsByCustomerIdAndProductId(customer.getId(), productId);
        if (hasReviewed) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "You have already reviewed this product."));
        }

        // 3. Set the data and save the review
        reviewRequest.setProductId(productId);
        reviewRequest.setCustomerId(customer.getId());
        reviewRequest.setCustomerName(customer.getName());

        Review savedReview = reviewRepository.save(reviewRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
    }

    /**
     * GET /products/{productId}/reviews/check
     * Checks if the current user is eligible to review this product.
     */
    @GetMapping("/check")
    public ResponseEntity<?> canUserReview(@PathVariable Long productId, Principal principal) {
        // Not logged in, so can't review.
        if (principal == null) {
            return ResponseEntity.ok(Map.of("canReview", false, "reason", "Not logged in."));
        }

        Customers customer = getCustomerFromPrincipal(principal);

        // Check if already reviewed
        boolean hasReviewed = reviewRepository.existsByCustomerIdAndProductId(customer.getId(), productId);
        if (hasReviewed) {
            return ResponseEntity.ok(Map.of("canReview", false, "reason", "You have already submitted a review."));
        }

        // Check if purchased
        boolean hasPurchased = orderService.hasCustomerPurchasedProduct(customer.getId(), productId);
        if (!hasPurchased) {
            return ResponseEntity.ok(Map.of("canReview", false, "reason", "You must purchase this item to review it."));
        }

        // All checks passed
        return ResponseEntity.ok(Map.of("canReview", true));
    }
}