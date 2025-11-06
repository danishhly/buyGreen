package com.buygreen.repository;

import com.buygreen.model.Customers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository <Customers, Long>{

    Customers findByEmail(String email);
    Customers findByResetToken(String token);
}
