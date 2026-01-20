package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.dto.*;
import com.rathnaproducts.backend.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerController {
    private final SellerService sellerService;

    @PostMapping("/login")
    public ResponseEntity<SellerResponse> login(@RequestBody SellerRequest request) {
        return ResponseEntity.ok(sellerService.login(request));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getSellerProducts() {
        return ResponseEntity.ok(sellerService.getSellerProducts());
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> addProduct(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam(required = false) String unit,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) MultipartFile productImage) {
        return ResponseEntity.ok(sellerService.addProduct(name, description, price, unit, categoryId, productImage));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam(required = false) String unit,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) MultipartFile productImage) {
        return ResponseEntity.ok(sellerService.updateProduct(id, name, description, price, unit, categoryId, productImage));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        sellerService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Object>> getSellerOrders() {
        return ResponseEntity.ok(sellerService.getSellerOrders());
    }
}