package com.rathnaproducts.backend.config;

import com.rathnaproducts.backend.model.Admin;
import com.rathnaproducts.backend.repo.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (adminRepository.findByUsername("RATHNA").isEmpty()) {
            Admin admin = new Admin();
            admin.setUsername("RATHNA");
            admin.setPassword(passwordEncoder.encode("MRPrasad@1"));
            adminRepository.save(admin);
        }
    }
}
