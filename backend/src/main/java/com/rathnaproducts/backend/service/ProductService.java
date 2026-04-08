package com.rathnaproducts.backend.service;

import com.rathnaproducts.backend.dto.ProductRequest;
import com.rathnaproducts.backend.dto.ProductResponse;
import com.rathnaproducts.backend.model.Product;
import com.rathnaproducts.backend.model.Category;
import com.rathnaproducts.backend.model.Seller;
import com.rathnaproducts.backend.repo.ProductRepository;
import com.rathnaproducts.backend.repo.CategoryRepository;
import com.rathnaproducts.backend.repo.SellerRepository;
import com.rathnaproducts.backend.repo.OrderItemRepository;
import com.rathnaproducts.backend.repo.ReturnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReturnRepository returnRepository;
    private final String uploadDir = "/var/www/rathnaproducts/uploads/products/";

    public List<ProductResponse> getAllProductsAdmin() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .filter(product -> product.getEnabled() == null || product.getEnabled())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsBySeller(String sellerEmail) {
        return productRepository.findBySellerEmail(sellerEmail).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .filter(product -> product.getEnabled() == null || product.getEnabled())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    public ProductResponse createProduct(ProductRequest request, MultipartFile productImage) {
        try {
            // Validate required fields
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                throw new RuntimeException("Product name is required");
            }
            if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Valid price is required");
            }
            
            Product product = new Product();
            product.setName(request.getName().trim());
            if (request.getDescription() != null) product.setDescription(request.getDescription().trim());
            product.setPrice(request.getPrice());
            if (request.getUnit() != null) product.setUnit(request.getUnit());
            if (request.getReturnable() != null) product.setReturnable(request.getReturnable());
            if (request.getReturnDays() != null) product.setReturnDays(request.getReturnDays());
            if (request.getReplaceable() != null) product.setReplaceable(request.getReplaceable());
            if (request.getReplacementDays() != null) product.setReplacementDays(request.getReplacementDays());
            if (request.getCardColor() != null) product.setCardColor(request.getCardColor());
            if (request.getStockQuantity() != null) {
                if (request.getStockQuantity() < 0) {
                    throw new RuntimeException("Stock quantity cannot be negative");
                }
                product.setStockQuantity(request.getStockQuantity());
            }
            if (request.getEnabled() != null) product.setEnabled(request.getEnabled());
            
            // Handle image upload - prioritize file upload over URL
            if (productImage != null && !productImage.isEmpty()) {
                try {
                    product.setProductImageUrl(saveImage(productImage));
                } catch (Exception e) {
                    throw new RuntimeException("Failed to upload image: " + e.getMessage());
                }
            } else if (request.getProductImageUrl() != null && !request.getProductImageUrl().trim().isEmpty()) {
                product.setProductImageUrl(request.getProductImageUrl());
            }
            
            if (request.getCategoryId() != null) {
                Category category = categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));
                product.setCategory(category);
            }
            
            if (request.getSellerEmail() != null) {
                Seller seller = sellerRepository.findByEmail(request.getSellerEmail())
                        .orElseThrow(() -> new RuntimeException("Seller not found with email: " + request.getSellerEmail()));
                product.setSeller(seller);
            }
            
            Product saved = productRepository.save(product);
            return mapToResponse(saved);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create product: " + e.getMessage());
        }
    }

    public ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile productImage) {
        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            
            // Only update non-null values, keep existing values for required fields
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                product.setName(request.getName());
            }
            if (request.getDescription() != null) {
                product.setDescription(request.getDescription());
            }
            if (request.getPrice() != null) {
                product.setPrice(request.getPrice());
            }
            if (request.getUnit() != null) {
                product.setUnit(request.getUnit());
            }
            if (request.getReturnable() != null) {
                product.setReturnable(request.getReturnable());
            }
            if (request.getReturnDays() != null) {
                product.setReturnDays(request.getReturnDays());
            }
            if (request.getReplaceable() != null) {
                product.setReplaceable(request.getReplaceable());
            }
            if (request.getReplacementDays() != null) {
                product.setReplacementDays(request.getReplacementDays());
            }
            if (request.getCardColor() != null && !request.getCardColor().trim().isEmpty()) {
                product.setCardColor(request.getCardColor());
            }
            if (request.getStockQuantity() != null) {
                product.setStockQuantity(request.getStockQuantity());
            }
            if (request.getEnabled() != null) {
                product.setEnabled(request.getEnabled());
            }
            
            // Handle image upload - prioritize file upload over URL
            if (productImage != null && !productImage.isEmpty()) {
                try {
                    product.setProductImageUrl(saveImage(productImage));
                } catch (Exception e) {
                    // Image save failed, continue without image
                }
            } else if (request.getProductImageUrl() != null && !request.getProductImageUrl().trim().isEmpty()) {
                product.setProductImageUrl(request.getProductImageUrl());
            }
            
            if (request.getCategoryId() != null) {
                Category category = categoryRepository.findById(request.getCategoryId())
                        .orElse(null);
                product.setCategory(category);
            }
            
            Product saved = productRepository.save(product);
            return mapToResponse(saved);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update product: " + e.getMessage());
        }
    }

    public void deleteProductBySeller(Long id, String sellerEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Verify the product belongs to the seller
        if (product.getSeller() == null || !product.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("You can only delete your own products");
        }
        
        // Manually delete related records first
        returnRepository.deleteByProductId(id);
        orderItemRepository.deleteByProductId(id);
        
        // Now delete the product
        productRepository.deleteById(id);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Manually delete related records first
        returnRepository.deleteByProductId(id);
        orderItemRepository.deleteByProductId(id);
        
        // Now delete the product
        productRepository.deleteById(id);
    }

    public String uploadProductImage(Long productId, MultipartFile image) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        String imageUrl = saveImage(image);
        product.setProductImageUrl(imageUrl);
        productRepository.save(product);
        
        return imageUrl;
    }

    private String saveImage(MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }
            
            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new RuntimeException("File size exceeds 5MB limit");
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed");
            }
            
            // Validate file extension
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                throw new RuntimeException("Invalid filename");
            }
            
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (!".jpg".equals(extension) && !".jpeg".equals(extension) && 
                !".png".equals(extension) && !".gif".equals(extension) && !".webp".equals(extension)) {
                throw new RuntimeException("Only JPG, PNG, GIF, and WebP files are allowed");
            }
            
            String fileName = UUID.randomUUID() + "_" + System.currentTimeMillis() + extension;
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            return "/uploads/products/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image: " + e.getMessage(), e);
        }
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product getProductEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void toggleProductStatus(Long id, Boolean enabled, String sellerEmail, String userType) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Verify permissions
        if ("admin".equals(userType)) {
            // Admin can toggle any product
        } else if (sellerEmail != null) {
            // Seller can only toggle their own products
            if (product.getSeller() == null || !product.getSeller().getEmail().equals(sellerEmail)) {
                throw new RuntimeException("You can only modify your own products");
            }
        } else {
            throw new RuntimeException("Unauthorized access");
        }
        
        product.setEnabled(enabled);
        productRepository.save(product);
    }

    public void updateStock(Long id, Integer stockQuantity, String sellerEmail, String userType) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Verify permissions
        if ("admin".equals(userType)) {
            // Admin can update any product stock
        } else if (sellerEmail != null) {
            // Seller can only update their own products
            if (product.getSeller() == null || !product.getSeller().getEmail().equals(sellerEmail)) {
                throw new RuntimeException("You can only modify your own products");
            }
        } else {
            throw new RuntimeException("Unauthorized access");
        }
        
        if (stockQuantity < 0) {
            throw new RuntimeException("Stock quantity cannot be negative");
        }
        
        product.setStockQuantity(stockQuantity);
        productRepository.save(product);
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setProductImageUrl(product.getProductImageUrl());
        response.setUnit(product.getUnit());
        response.setReturnable(product.getReturnable());
        response.setReturnDays(product.getReturnDays());
        response.setReplaceable(product.getReplaceable());
        response.setReplacementDays(product.getReplacementDays());
        response.setCardColor(product.getCardColor());
        response.setStockQuantity(product.getStockQuantity());
        response.setEnabled(product.getEnabled());
        response.setAdditionalImages(product.getAdditionalImages());
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }
        if (product.getSeller() != null) {
            response.setSellerId(product.getSeller().getId());
            response.setSellerName(product.getSeller().getName());
            response.setSellerEmail(product.getSeller().getEmail());
        }
        return response;
    }
}