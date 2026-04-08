package com.rathnaproducts.backend.repo;

import com.rathnaproducts.backend.model.Order;
import com.rathnaproducts.backend.model.User;
import com.rathnaproducts.backend.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findBySellerOrderByCreatedAtDesc(Seller seller);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
    
    @Query("SELECT o FROM Order o WHERE o.shiprocketOrderId = :srOrderId OR o.awbCode = :awbCode")
    Optional<Order> findByShiprocketOrderIdOrAwbCode(@Param("srOrderId") String srOrderId, @Param("awbCode") String awbCode);
}