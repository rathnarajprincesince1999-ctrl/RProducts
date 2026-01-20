package com.rathnaproducts.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String unit;
    private Long categoryId;
    private String sellerEmail;
    private Boolean returnable = false;
    private Integer returnDays = 0;
    private Boolean replaceable = false;
    private Integer replacementDays = 0;
    private String cardColor = "#3B82F6";
    private String productImageUrl;
}