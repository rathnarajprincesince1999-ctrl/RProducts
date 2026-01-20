package com.rathnaproducts.backend.repo;

import com.rathnaproducts.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    
    @Query("SELECT p FROM Product p WHERE p.seller.email = :sellerEmail")
    List<Product> findBySellerEmail(@Param("sellerEmail") String sellerEmail);
    
    List<Product> findBySellerId(Long sellerId);
}