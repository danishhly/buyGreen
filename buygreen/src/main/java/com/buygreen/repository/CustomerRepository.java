package com.buygreen.repository;

import com.buygreen.model.Customers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface CustomerRepository extends JpaRepository <Customers, Long>{

    Customers findByEmail(String email);
    Customers findByResetToken(String token);
    
    // ADDED: For calculating new customers count
    Long countByRegistrationDateAfter(LocalDateTime date);
    
    // ADDED: For populating registration chart data
    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE(registration_date) as reg_date, COUNT(*) as count FROM customers WHERE registration_date >= ?1 GROUP BY reg_date ORDER BY reg_date", nativeQuery = true)
    java.util.List<Object[]> findNewCustomersByDateAfter(LocalDateTime startDate);
}
