package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.dto.CategoryRequest;
import com.rathnaproducts.backend.dto.CategoryResponse;
import com.rathnaproducts.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam(value = "color", required = false) String color,
            @RequestParam(value = "categoryImage", required = false) MultipartFile categoryImage,
            @RequestParam(value = "bannerImage", required = false) MultipartFile bannerImage,
            @RequestParam(value = "bannerImages", required = false) MultipartFile[] bannerImages) {
        
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        request.setDescription(description);
        request.setColor(color);
        
        CategoryResponse response = categoryService.createCategory(request, categoryImage, bannerImage, bannerImages);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/simple")
    public ResponseEntity<CategoryResponse> createSimpleCategory(
            @RequestParam("name") String name,
            @RequestParam("description") String description) {
        
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        request.setDescription(description);
        
        CategoryResponse response = categoryService.createCategory(request, null, null);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam(value = "color", required = false) String color,
            @RequestParam(value = "categoryImage", required = false) MultipartFile categoryImage,
            @RequestParam(value = "bannerImage", required = false) MultipartFile bannerImage,
            @RequestParam(value = "bannerImages", required = false) MultipartFile[] bannerImages) {
        
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        request.setDescription(description);
        request.setColor(color);
        
        CategoryResponse response = categoryService.updateCategory(id, request, categoryImage, bannerImage, bannerImages);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}