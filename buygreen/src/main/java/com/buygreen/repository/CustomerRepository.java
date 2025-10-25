package com.buygreen.repository;

import com.buygreen.model.Customers;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CustomerRepository extends JpaRepository <Customers, Long>{

    Customers findByEmail(String email);
}
