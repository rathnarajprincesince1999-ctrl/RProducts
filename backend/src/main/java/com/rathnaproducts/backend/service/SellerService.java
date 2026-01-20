package com.rathnaproducts.backend.service;

import com.rathnaproducts.backend.config.JwtUtil;
import com.rathnaproducts.backend.dto.*;
import com.rathnaproducts.backend.model.*;
import com.rathnaproducts.backend.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerService {
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public SellerResponse login(SellerRequest request) {
        try {
            System.out.println("Attempting seller login for username: " + request.getUsername());
            
            Seller seller = sellerRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Seller not found with username: " + request.getUsername()));
            
            System.out.println("Found seller: " + seller.getName() + " with username: " + seller.getUsername());
            
            if (!passwordEncoder.matches(request.getPassword(), seller.getPassword())) {
                System.out.println("Password mismatch for seller: " + request.getUsername());
                throw new RuntimeException("Invalid password for seller: " + request.getUsername());
            }
            
            System.out.println("Password matches, creating response for seller: " + seller.getUsername());
            
            SellerResponse response = new SellerResponse(seller.getId(), seller.getUsername(), seller.getName(), seller.getEmail());
            response.setToken(jwtUtil.generateToken(seller.getUsername()));
            
            System.out.println("Seller login successful for: " + seller.getUsername());
            return response;
        } catch (Exception e) {
            System.err.println("Seller login error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    public List<ProductResponse> getSellerProducts() {
        return productRepository.findAll().stream()
            .map(this::mapToProductResponse)
            .collect(Collectors.toList());
    }

    public ProductResponse addProduct(String name, String description, Double price, String unit, Long categoryId, MultipartFile productImage) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(BigDecimal.valueOf(price));
        product.setUnit(unit);
        
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId).orElse(null);
            product.setCategory(category);
        }

        if (productImage != null && !productImage.isEmpty()) {
            String imageUrl = saveProductImage(productImage);
            product.setProductImageUrl(imageUrl);
        }

        product = productRepository.save(product);
        return mapToProductResponse(product);
    }

    public ProductResponse updateProduct(Long id, String name, String description, Double price, String unit, Long categoryId, MultipartFile productImage) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        product.setName(name);
        product.setDescription(description);
        product.setPrice(BigDecimal.valueOf(price));
        product.setUnit(unit);
        
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId).orElse(null);
            product.setCategory(category);
        }

        if (productImage != null && !productImage.isEmpty()) {
            String imageUrl = saveProductImage(productImage);
            product.setProductImageUrl(imageUrl);
        }

        product = productRepository.save(product);
        return mapToProductResponse(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Object> getSellerOrders() {
        // Get current seller from security context
        // For now returning empty list - will be implemented with proper authentication
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
            .filter(order -> order.getSeller() != null)
            .collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setProductImageUrl(product.getProductImageUrl());
        response.setUnit(product.getUnit());
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }
        return response;
    }

    private String saveProductImage(MultipartFile file) {
        try {
            String uploadDir = "uploads/products/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            return "/" + uploadDir + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }
}