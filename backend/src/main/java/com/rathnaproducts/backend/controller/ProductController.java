package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.dto.ProductRequest;
import com.rathnaproducts.backend.dto.ProductResponse;
import com.rathnaproducts.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.rathnaproducts.backend.model.Product;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(value = "userType", required = false) String userType,
            @RequestParam(value = "sellerEmail", required = false) String sellerEmail) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        
        if ("admin".equals(userType)) {
            return ResponseEntity.ok(productService.getAllProductsAdmin());
        } else if ("seller".equals(userType)) {
            if (sellerEmail != null && !sellerEmail.isEmpty()) {
                return ResponseEntity.ok(productService.getProductsBySeller(sellerEmail));
            } else if (email != null) {
                return ResponseEntity.ok(productService.getProductsBySeller(email));
            }
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/seller")
    public ResponseEntity<List<ProductResponse>> getSellerProducts() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        
        if (email != null) {
            return ResponseEntity.ok(productService.getProductsBySeller(email));
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile image) {
        try {
            String imageUrl = saveImage(image);
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        }
    }
    
    private String saveImage(MultipartFile file) {
        try {
            String fileName = java.util.UUID.randomUUID() + "_" + file.getOriginalFilename();
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("/var/www/rathnaproducts/uploads/products/");
            java.nio.file.Files.createDirectories(uploadPath);
            
            java.nio.file.Path filePath = uploadPath.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath);
            
            return "/uploads/products/" + fileName;
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    @PostMapping("/json")
    public ResponseEntity<?> createProductJson(@RequestBody ProductRequest request) {
        try {
            ProductResponse response = productService.createProduct(request, null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "unit", required = false) String unit,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "productImage", required = false) MultipartFile productImage,
            @RequestParam(value = "sellerEmail", required = false) String sellerEmail,
            @RequestParam(value = "returnable", required = false, defaultValue = "false") Boolean returnable,
            @RequestParam(value = "returnDays", required = false, defaultValue = "0") Integer returnDays,
            @RequestParam(value = "replaceable", required = false, defaultValue = "false") Boolean replaceable,
            @RequestParam(value = "replacementDays", required = false, defaultValue = "0") Integer replacementDays,
            @RequestParam(value = "cardColor", required = false, defaultValue = "#3B82F6") String cardColor,
            @RequestParam(value = "stockQuantity", required = false, defaultValue = "0") Integer stockQuantity) {
        
        try {
            ProductRequest request = new ProductRequest();
            request.setName(name);
            request.setDescription(description);
            request.setPrice(price);
            request.setUnit(unit);
            request.setCategoryId(categoryId);
            request.setSellerEmail(sellerEmail);
            request.setReturnable(returnable);
            request.setReturnDays(returnDays);
            request.setReplaceable(replaceable);
            request.setReplacementDays(replacementDays);
            request.setCardColor(cardColor);
            request.setStockQuantity(stockQuantity);
            
            ProductResponse response = productService.createProduct(request, productImage);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-images")
    public ResponseEntity<List<String>> uploadProductImages(
            @PathVariable Long id,
            @RequestParam("images") MultipartFile[] images) {
        try {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile image : images) {
                String imageUrl = saveImage(image);
                imageUrls.add(imageUrl);
            }
            
            Product product = productService.getProductEntityById(id);
            if (product.getAdditionalImages() == null) {
                product.setAdditionalImages(new ArrayList<>());
            }
            product.getAdditionalImages().addAll(imageUrls);
            productService.saveProduct(product);
            
            return ResponseEntity.ok(imageUrls);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request, null);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/multipart")
    public ResponseEntity<?> updateProductMultipart(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "unit", required = false) String unit,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "productImage", required = false) MultipartFile productImage,
            @RequestParam(value = "sellerEmail", required = false) String sellerEmail,
            @RequestParam(value = "returnable", required = false, defaultValue = "false") Boolean returnable,
            @RequestParam(value = "returnDays", required = false, defaultValue = "0") Integer returnDays,
            @RequestParam(value = "replaceable", required = false, defaultValue = "false") Boolean replaceable,
            @RequestParam(value = "replacementDays", required = false, defaultValue = "0") Integer replacementDays,
            @RequestParam(value = "cardColor", required = false, defaultValue = "#3B82F6") String cardColor,
            @RequestParam(value = "stockQuantity", required = false) Integer stockQuantity) {
        
        try {
            ProductRequest request = new ProductRequest();
            request.setName(name);
            request.setDescription(description);
            request.setPrice(price);
            request.setUnit(unit);
            request.setCategoryId(categoryId);
            request.setSellerEmail(sellerEmail);
            request.setReturnable(returnable);
            request.setReturnDays(returnDays);
            request.setReplaceable(replaceable);
            request.setReplacementDays(replacementDays);
            request.setCardColor(cardColor);
            if (stockQuantity != null) request.setStockQuantity(stockQuantity);
            
            ProductResponse response = productService.updateProduct(id, request, productImage);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<String> toggleProductStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> request) {
        try {
            Boolean enabled = (Boolean) request.get("enabled");
            String sellerEmail = (String) request.get("sellerEmail");
            String userType = (String) request.get("userType");
            
            productService.toggleProductStatus(id, enabled, sellerEmail, userType);
            return ResponseEntity.ok("Product status updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<String> updateStock(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> request) {
        try {
            Integer stockQuantity = (Integer) request.get("stockQuantity");
            String sellerEmail = (String) request.get("sellerEmail");
            String userType = (String) request.get("userType");
            
            productService.updateStock(id, stockQuantity, sellerEmail, userType);
            return ResponseEntity.ok("Stock updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id,
            @RequestParam(value = "sellerEmail", required = false) String sellerEmail,
            @RequestParam(value = "userType", required = false) String userType) {
        try {
            if ("admin".equals(userType)) {
                productService.deleteProduct(id);
            } else {
                productService.deleteProductBySeller(id, sellerEmail);
            }
            return ResponseEntity.ok("Product deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}