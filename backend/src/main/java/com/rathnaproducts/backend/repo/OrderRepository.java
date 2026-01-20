package com.rathnaproducts.backend.repo;

import com.rathnaproducts.backend.model.Order;
import com.rathnaproducts.backend.model.User;
import com.rathnaproducts.backend.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findBySellerOrderByCreatedAtDesc(Seller seller);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
}