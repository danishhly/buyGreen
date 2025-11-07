package com.buygreen.repository;


import com.buygreen.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByCustomerId(Long customerId);
    Optional<Wishlist> findByCustomerIdAndProductId(Long customerId, Long productId);

    // Spring Data JPA can create a delete query from the method name
    void deleteByCustomerIdAndProductId(Long customerId, Long productId);
}
