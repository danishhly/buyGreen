package com.buygreen.repository;


import com.buygreen.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByReviewDateDesc(Long productId);

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

}
