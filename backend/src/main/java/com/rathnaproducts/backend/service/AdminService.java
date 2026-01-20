package com.rathnaproducts.backend.service;

import com.rathnaproducts.backend.config.JwtUtil;
import com.rathnaproducts.backend.dto.*;
import com.rathnaproducts.backend.mapper.AdminMapper;
import com.rathnaproducts.backend.model.Admin;
import com.rathnaproducts.backend.model.Seller;
import com.rathnaproducts.backend.model.AdminEmail;
import com.rathnaproducts.backend.repo.AdminRepository;
import com.rathnaproducts.backend.repo.SellerRepository;
import com.rathnaproducts.backend.repo.AdminEmailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    private final SellerRepository sellerRepository;
    private final AdminEmailRepository adminEmailRepository;
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminResponse login(AdminLoginRequest request) {
        Admin admin = adminRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        AdminResponse response = adminMapper.toResponse(admin);
        response.setToken(jwtUtil.generateToken(admin.getUsername()));
        return response;
    }

    public List<SellerResponse> getAllSellers() {
        return sellerRepository.findAll().stream()
            .map(seller -> new SellerResponse(seller.getId(), seller.getUsername(), seller.getName(), seller.getEmail()))
            .collect(Collectors.toList());
    }

    public SellerResponse addSeller(SellerRequest request) {
        // Check if username already exists
        if (sellerRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists
        if (sellerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        Seller seller = new Seller(
            request.getUsername(),
            passwordEncoder.encode(request.getPassword()),
            request.getName(),
            request.getEmail()
        );
        seller = sellerRepository.save(seller);
        return new SellerResponse(seller.getId(), seller.getUsername(), seller.getName(), seller.getEmail());
    }

    public void deleteSeller(Long id) {
        sellerRepository.deleteById(id);
    }

    public SellerResponse updateSeller(Long id, SellerRequest request) {
        Seller seller = sellerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        seller.setName(request.getName());
        seller.setUsername(request.getUsername());
        seller.setEmail(request.getEmail());
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            seller.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        seller = sellerRepository.save(seller);
        return new SellerResponse(seller.getId(), seller.getUsername(), seller.getName(), seller.getEmail());
    }

    public boolean verifyAdminEmail(String email) {
        return adminEmailRepository.existsByEmailAndActiveTrue(email);
    }
}
