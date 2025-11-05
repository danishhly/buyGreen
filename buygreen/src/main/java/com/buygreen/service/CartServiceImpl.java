package com.buygreen.service;

import com.buygreen.model.Cart;
import com.buygreen.model.Product;
import com.buygreen.repository.CartRepository;
import com.buygreen.repository.CustomerRepository;
import com.buygreen.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository repo;

    @Autowired
    private CustomerRepository customerRepo;

    @Autowired
    private ProductRepository productRepo;

    @Override
    public String addToCart(Cart cart) {
        // 1. Find the product to check its stock
        Product product = productRepo.findById(cart.getProductId())
                .orElse(null);

        if (product == null) {
            return "Product not found";
        }

        // 2. Find the existing cart item, if any
        Cart existing = repo.findByCustomerIdAndProductId(cart.getCustomerId(), cart.getProductId());

        int newQuantity;

        if (existing != null) {
            // This is an existing item, calculate the new total quantity
            newQuantity = existing.getQuantity() + cart.getQuantity();
        } else {
            // This is a new item being added to the cart
            newQuantity = cart.getQuantity();
        }

        // 3. This is the new stock check!
        if (newQuantity > product.getStockQuantity()) {
            // Not enough stock, return an error message
            return "Not enough stock. Only " + product.getStockQuantity() + " available.";
        }

        // 4. If enough stock, save the cart
        if (existing != null) {
            existing.setQuantity(newQuantity);
            repo.save(existing);
        } else {
            cart.setQuantity(newQuantity); // Set the quantity on the new cart item
            repo.save(cart);
        }

        return "Item added to cart";
    }

    @Override
    public List<Cart> getCartItems(Long customerId) {
        return repo.findByCustomerId(customerId);
    }

    @Override
    public void removeFromCart(Long id) {
        repo.deleteById(id);
    }

    @Override
    public void clearCartByCustomerId(Long customerId) {
        repo.deleteByCustomerId(customerId);
    }

    @Override
    public Cart decrementItem(Long customerId, Long productId) {
        Cart existing = repo.findByCustomerIdAndProductId(customerId, productId);


        if (existing == null) {
            return null;
        }

        if (existing.getQuantity() > 1) {
            existing.setQuantity(existing.getQuantity() - 1);
            return repo.save(existing);
        }

        repo.delete(existing);
        return null;
    }
}
