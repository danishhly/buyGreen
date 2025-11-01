package com.buygreen.repository;

import com.buygreen.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    List<Cart> findByCustomerId(Long customerId);
    Cart findByCustomerIdAndProductId(Long customerId, Long productId);
    void deleteByCustomerId(Long customerId);
}
