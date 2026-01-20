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

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReturnRepository returnRepository;
    private final String uploadDir = "uploads/products/";

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
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
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    public ProductResponse createProduct(ProductRequest request, MultipartFile productImage) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setReturnable(request.getReturnable());
        product.setReturnDays(request.getReturnDays());
        product.setReplaceable(request.getReplaceable());
        product.setReplacementDays(request.getReplacementDays());
        product.setCardColor(request.getCardColor());
        
        if (request.getProductImageUrl() != null) {
            product.setProductImageUrl(request.getProductImageUrl());
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        
        if (request.getSellerEmail() != null) {
            Seller seller = sellerRepository.findByEmail(request.getSellerEmail())
                    .orElseThrow(() -> new RuntimeException("Seller not found"));
            product.setSeller(seller);
        }
        
        if (productImage != null && !productImage.isEmpty()) {
            try {
                product.setProductImageUrl(saveImage(productImage));
            } catch (Exception e) {
                // Image save failed, continue without image
            }
        }
        
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile productImage) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setReturnable(request.getReturnable());
        product.setReturnDays(request.getReturnDays());
        product.setReplaceable(request.getReplaceable());
        product.setReplacementDays(request.getReplacementDays());
        product.setCardColor(request.getCardColor());
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        
        if (request.getSellerEmail() != null) {
            Seller seller = sellerRepository.findByEmail(request.getSellerEmail())
                    .orElseThrow(() -> new RuntimeException("Seller not found"));
            product.setSeller(seller);
        }
        
        if (productImage != null && !productImage.isEmpty()) {
            try {
                product.setProductImageUrl(saveImage(productImage));
            } catch (Exception e) {
                // Image save failed, continue without image
            }
        }
        
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
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
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            return "/uploads/products/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
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