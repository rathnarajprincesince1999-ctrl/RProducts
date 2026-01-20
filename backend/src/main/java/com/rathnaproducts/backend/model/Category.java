package com.rathnaproducts.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String categoryImageUrl;
    private String bannerImageUrl;
    
    @ElementCollection
    @CollectionTable(name = "category_banner_images", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "banner_url")
    private List<String> bannerImageUrls;
    
    private String color; // Category color for border
}