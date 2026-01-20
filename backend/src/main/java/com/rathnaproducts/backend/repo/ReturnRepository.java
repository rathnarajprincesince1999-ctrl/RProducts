package com.rathnaproducts.backend.repo;

import com.rathnaproducts.backend.model.Return;
import com.rathnaproducts.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface ReturnRepository extends JpaRepository<Return, Long> {
    List<Return> findByOrderOrderByCreatedAtDesc(Order order);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Return r WHERE r.product.id = :productId")
    void deleteByProductId(Long productId);

    List<Return> findAllByOrderByCreatedAtDesc();
    
    @Query("SELECT r FROM Return r WHERE r.product.seller.email = :sellerEmail ORDER BY r.createdAt DESC")
    List<Return> findBySellerEmailOrderByCreatedAtDesc(String sellerEmail);
    
    @Query("SELECT r FROM Return r WHERE r.order.user.email = :userEmail ORDER BY r.createdAt DESC")
    List<Return> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}