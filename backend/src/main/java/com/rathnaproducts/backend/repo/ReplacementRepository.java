package com.rathnaproducts.backend.repo;

import com.rathnaproducts.backend.model.Replacement;
import com.rathnaproducts.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReplacementRepository extends JpaRepository<Replacement, Long> {
    List<Replacement> findByUserOrderByCreatedAtDesc(User user);
    List<Replacement> findAllByOrderByCreatedAtDesc();
}