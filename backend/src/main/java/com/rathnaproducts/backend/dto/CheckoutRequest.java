package com.rathnaproducts.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CheckoutRequest {
    @NotNull(message = "Items are required")
    private List<CheckoutItem> items;
    
    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    
    private String transactionId;
    
    private String mode; // "simple" or "express"
    
    private ShippingDetails shippingDetails;
    
    @Data
    public static class ShippingDetails {
        @NotBlank(message = "Address is required")
        private String address;
        
        @NotBlank(message = "City is required")
        private String city;
        
        @NotBlank(message = "State is required")
        private String state;
        
        @NotBlank(message = "Pincode is required")
        private String pincode;
        
        @NotBlank(message = "Phone is required")
        private String phone;
        
        private String landmark;
        
        private String addressType;
    }
    
    @Data
    public static class CheckoutItem {
        @NotNull(message = "Product ID is required")
        private Long productId;
        
        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;
        
        @NotNull(message = "Price is required")
        @Positive(message = "Price must be positive")
        private BigDecimal price;
    }
}