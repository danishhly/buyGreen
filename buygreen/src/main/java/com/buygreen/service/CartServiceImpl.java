package com.buygreen.service;

import com.buygreen.model.Cart;
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
        Cart existing = repo.findByCustomerIdAndProductId(cart.getCustomerId(), cart.getProductId());
        if(existing != null) {
            existing.setQuantity(existing.getQuantity() + 1);
        } else {
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
}
