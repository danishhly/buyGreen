package com.buygreen.repository;

import com.buygreen.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);

    Page<Order> findAllByOrderByOrderDateDesc(Pageable pageable);

    @Query("SELECT COUNT(o) > 0 from Order o join o.items i where o.customerId = ?1 AND i.productId= ?2")
    boolean hasCustomerPurchasedProduct(Long customerId, Long productId);

    // Analytics queries
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status != 'CANCELLED'")
    Long getTotalOrdersCount();

    @Query("SELECT COALESCE(SUM(o.discountAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal getTotalDiscounts();

    @Query("SELECT COUNT(DISTINCT o.customerId) FROM Order o WHERE o.status != 'CANCELLED'")
    Long getTotalCustomersCount();

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> getOrdersByStatus();

    @Query("SELECT o.status, COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED' GROUP BY o.status")
    List<Object[]> getRevenueByStatus();

    @Query("SELECT DATE(o.orderDate), COUNT(o) FROM Order o WHERE o.orderDate >= :startDate AND o.status != 'CANCELLED' GROUP BY DATE(o.orderDate) ORDER BY DATE(o.orderDate)")
    List<Object[]> getOrdersByDate(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT DATE(o.orderDate), COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderDate >= :startDate AND o.status != 'CANCELLED' GROUP BY DATE(o.orderDate) ORDER BY DATE(o.orderDate)")
    List<Object[]> getRevenueByDate(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Order o JOIN o.items i WHERE o.status != 'CANCELLED'")
    Long getTotalItemsSold();
}
