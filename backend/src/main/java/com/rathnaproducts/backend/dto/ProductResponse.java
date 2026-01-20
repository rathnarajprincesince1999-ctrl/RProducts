package com.rathnaproducts.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String productImageUrl;
    private Long categoryId;
    private String categoryName;
    private String unit;
    private Long sellerId;
    private String sellerName;
    private String sellerEmail;
    private Boolean returnable = false;
    private Integer returnDays = 0;
    private Boolean replaceable = false;
    private Integer replacementDays = 0;
    private String cardColor = "#c2d5f5";
}