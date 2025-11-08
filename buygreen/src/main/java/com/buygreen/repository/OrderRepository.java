package com.buygreen.repository;

import com.buygreen.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);

    Page<Order> findAllByOrderByOrderDateDesc(Pageable pageable);

    @Query("SELECT COUNT(o) > 0 from Order o join o.items i where o.customerId = ?1 AND i.productId= ?2")
    boolean hasCustomerPurchasedProduct(Long customerId, Long productId);
}
