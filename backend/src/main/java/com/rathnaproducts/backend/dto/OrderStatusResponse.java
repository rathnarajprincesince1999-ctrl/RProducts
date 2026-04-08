package com.rathnaproducts.backend.dto;

import java.time.LocalDateTime;
import java.math.BigDecimal;

public class OrderStatusResponse {
    private Long orderId;
    private String status;
    private String statusDescription;
    private BigDecimal total;
    private LocalDateTime createdAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private Boolean adminApproved;
    private String rejectionReason;
    
    // Shipping details
    private String awbCode;
    private String courierName;
    private String shiprocketOrderId;
    
    // Package details
    private Double packageWeight;
    private Integer packageLength;
    private Integer packageBreadth;
    private Integer packageHeight;
    
    // User and seller info
    private String userName;
    private String userEmail;
    private String sellerName;
    private String sellerEmail;
    
    // Constructors
    public OrderStatusResponse() {}
    
    // Getters and Setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { 
        this.status = status;
        this.statusDescription = getStatusDescription(status);
    }
    
    public String getStatusDescription() { return statusDescription; }
    public void setStatusDescription(String statusDescription) { this.statusDescription = statusDescription; }
    
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getShippedAt() { return shippedAt; }
    public void setShippedAt(LocalDateTime shippedAt) { this.shippedAt = shippedAt; }
    
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
    
    public Boolean getAdminApproved() { return adminApproved; }
    public void setAdminApproved(Boolean adminApproved) { this.adminApproved = adminApproved; }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    
    public String getAwbCode() { return awbCode; }
    public void setAwbCode(String awbCode) { this.awbCode = awbCode; }
    
    public String getCourierName() { return courierName; }
    public void setCourierName(String courierName) { this.courierName = courierName; }
    
    public String getShiprocketOrderId() { return shiprocketOrderId; }
    public void setShiprocketOrderId(String shiprocketOrderId) { this.shiprocketOrderId = shiprocketOrderId; }
    
    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }
    
    public Integer getPackageLength() { return packageLength; }
    public void setPackageLength(Integer packageLength) { this.packageLength = packageLength; }
    
    public Integer getPackageBreadth() { return packageBreadth; }
    public void setPackageBreadth(Integer packageBreadth) { this.packageBreadth = packageBreadth; }
    
    public Integer getPackageHeight() { return packageHeight; }
    public void setPackageHeight(Integer packageHeight) { this.packageHeight = packageHeight; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    
    public String getSellerEmail() { return sellerEmail; }
    public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }
    
    private String getStatusDescription(String status) {
        switch (status) {
            case "PENDING": return "Order placed, waiting for admin approval";
            case "APPROVED": return "Admin approved, seller can add package details";
            case "PACKAGE_READY": return "Package details added, preparing for shipment";
            case "SHIPPED": return "Order shipped and on the way";
            case "DELIVERED": return "Order delivered successfully";
            case "CANCELLED": return "Order cancelled";
            case "REJECTED": return "Order rejected by admin";
            default: return "Unknown status";
        }
    }
}