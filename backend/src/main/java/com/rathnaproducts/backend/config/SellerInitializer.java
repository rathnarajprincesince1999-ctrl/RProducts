package com.rathnaproducts.backend.config;

import com.rathnaproducts.backend.model.Seller;
import com.rathnaproducts.backend.repo.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SellerInitializer implements CommandLineRunner {
    
    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // No default sellers - admin must create them through AdminSellers page
    }
}