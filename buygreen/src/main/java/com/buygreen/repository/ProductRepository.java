package com.buygreen.repository;

import com.buygreen.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p from Product p where p.name Like %?1% OR p.description like %?1%")
    Page<Product> searchByNameOrDescription(String query, Pageable pageable);

}
