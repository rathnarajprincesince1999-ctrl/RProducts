package com.rathnaproducts.backend.service;

import com.rathnaproducts.backend.dto.CategoryRequest;
import com.rathnaproducts.backend.dto.CategoryResponse;
import com.rathnaproducts.backend.model.Category;
import com.rathnaproducts.backend.repo.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final String uploadDir = "uploads/categories/";

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse createCategory(CategoryRequest request, MultipartFile categoryImage, MultipartFile bannerImage) {
        return createCategory(request, categoryImage, bannerImage, null);
    }

    public CategoryResponse createCategory(CategoryRequest request, MultipartFile categoryImage, MultipartFile bannerImage, MultipartFile[] bannerImages) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setColor(request.getColor());
        
        if (categoryImage != null && !categoryImage.isEmpty()) {
            try {
                category.setCategoryImageUrl(saveImage(categoryImage, "category"));
            } catch (Exception e) {
                System.err.println("Failed to save category image: " + e.getMessage());
            }
        }
        
        if (bannerImage != null && !bannerImage.isEmpty()) {
            try {
                category.setBannerImageUrl(saveImage(bannerImage, "banner"));
            } catch (Exception e) {
                System.err.println("Failed to save banner image: " + e.getMessage());
            }
        }
        
        if (bannerImages != null && bannerImages.length > 0) {
            List<String> bannerUrls = new ArrayList<>();
            for (MultipartFile bannerImg : bannerImages) {
                if (bannerImg != null && !bannerImg.isEmpty()) {
                    try {
                        bannerUrls.add(saveImage(bannerImg, "banner"));
                    } catch (Exception e) {
                        System.err.println("Failed to save banner image: " + e.getMessage());
                    }
                }
            }
            category.setBannerImageUrls(bannerUrls);
        }
        
        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request, MultipartFile categoryImage, MultipartFile bannerImage) {
        return updateCategory(id, request, categoryImage, bannerImage, null);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request, MultipartFile categoryImage, MultipartFile bannerImage, MultipartFile[] bannerImages) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setColor(request.getColor());
        
        if (categoryImage != null && !categoryImage.isEmpty()) {
            try {
                category.setCategoryImageUrl(saveImage(categoryImage, "category"));
            } catch (Exception e) {
                System.err.println("Failed to save category image: " + e.getMessage());
            }
        }
        
        if (bannerImage != null && !bannerImage.isEmpty()) {
            try {
                category.setBannerImageUrl(saveImage(bannerImage, "banner"));
            } catch (Exception e) {
                System.err.println("Failed to save banner image: " + e.getMessage());
            }
        }
        
        if (bannerImages != null && bannerImages.length > 0) {
            List<String> bannerUrls = new ArrayList<>();
            for (MultipartFile bannerImg : bannerImages) {
                if (bannerImg != null && !bannerImg.isEmpty()) {
                    try {
                        bannerUrls.add(saveImage(bannerImg, "banner"));
                    } catch (Exception e) {
                        System.err.println("Failed to save banner image: " + e.getMessage());
                    }
                }
            }
            category.setBannerImageUrls(bannerUrls);
        }
        
        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private String saveImage(MultipartFile file, String type) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir + type);
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            return "/uploads/categories/" + type + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setColor(category.getColor());
        response.setCategoryImageUrl(category.getCategoryImageUrl());
        response.setBannerImageUrl(category.getBannerImageUrl());
        response.setBannerImageUrls(category.getBannerImageUrls());
        return response;
    }
}