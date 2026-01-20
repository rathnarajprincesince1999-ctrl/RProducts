package com.rathnaproducts.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private String productImageUrl;
    
    public String getImageUrl() {
        return productImageUrl;
    }
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    @ManyToOne
    @JoinColumn(name = "seller_id")
    @JsonIgnoreProperties({"password"})
    private Seller seller;
    
    @Column
    private String unit; // kg, pack, numbers, grams
    
    @Column(name = "returnable")
    private Boolean returnable = false;
    
    @Column(name = "return_days")
    private Integer returnDays = 0;
    
    @Column(name = "replaceable")
    private Boolean replaceable = false;
    
    @Column(name = "replacement_days")
    private Integer replacementDays = 0;
    
    @Column(name = "card_color")
    private String cardColor = "#3B82F6"; // Default blue color
}