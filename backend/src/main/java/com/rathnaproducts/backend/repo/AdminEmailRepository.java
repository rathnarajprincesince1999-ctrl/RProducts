package com.rathnaproducts.backend.repo;

import com.rathnaproducts.backend.model.AdminEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminEmailRepository extends JpaRepository<AdminEmail, Long> {
    boolean existsByEmailAndActiveTrue(String email);
}