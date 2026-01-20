package com.rathnaproducts.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String categoryImageUrl;
    private String bannerImageUrl;
    private List<String> bannerImageUrls;
    private String color;
}