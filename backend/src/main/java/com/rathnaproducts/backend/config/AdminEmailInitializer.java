package com.rathnaproducts.backend.config;

import com.rathnaproducts.backend.model.AdminEmail;
import com.rathnaproducts.backend.repo.AdminEmailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminEmailInitializer implements CommandLineRunner {
    private final AdminEmailRepository adminEmailRepository;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "rathnarajprincesince1999@gmail.com";
        if (!adminEmailRepository.existsByEmailAndActiveTrue(adminEmail)) {
            AdminEmail email = new AdminEmail(adminEmail);
            adminEmailRepository.save(email);
        }
    }
}