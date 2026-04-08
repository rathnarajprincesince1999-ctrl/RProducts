package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.dto.*;
import com.rathnaproducts.backend.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerController {
    private final SellerService sellerService;

    @GetMapping("/sellers")
    public ResponseEntity<List<SellerResponse>> getAllSellers() {
        return ResponseEntity.ok(sellerService.getAllSellers());
    }

    @PostMapping("/seller/login")
    public ResponseEntity<SellerResponse> login(@RequestBody SellerRequest request) {
        return ResponseEntity.ok(sellerService.login(request));
    }

    @GetMapping("/seller/products")
    public ResponseEntity<List<ProductResponse>> getSellerProducts() {
        return ResponseEntity.ok(sellerService.getSellerProducts());
    }

    @PostMapping("/seller/products")
    public ResponseEntity<ProductResponse> addProduct(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam(required = false) String unit,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) MultipartFile productImage) {
        return ResponseEntity.ok(sellerService.addProduct(name, description, price, unit, categoryId, productImage));
    }

    @PutMapping("/seller/products/{id}")
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

    @DeleteMapping("/seller/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        sellerService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/seller/orders")
    public ResponseEntity<List<Object>> getSellerOrders() {
        return ResponseEntity.ok(sellerService.getSellerOrders());
    }
}