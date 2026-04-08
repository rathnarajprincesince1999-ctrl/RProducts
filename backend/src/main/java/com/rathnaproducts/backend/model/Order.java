package com.rathnaproducts.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "orders")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "transaction_id")
    private String transactionId;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @Column(name = "admin_approved")
    private Boolean adminApproved = false;
    
    // Shipping details for Shiprocket
    @Column(name = "package_weight")
    private Double packageWeight;
    
    @Column(name = "package_length")
    private Integer packageLength;
    
    @Column(name = "package_breadth")
    private Integer packageBreadth;
    
    @Column(name = "package_height")
    private Integer packageHeight;
    
    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;
    
    // Customer shipping details
    @Column(name = "shipping_address", length = 500)
    private String shippingAddress;
    
    @Column(name = "shipping_city")
    private String shippingCity;
    
    @Column(name = "shipping_state")
    private String shippingState;
    
    @Column(name = "shipping_pincode")
    private String shippingPincode;
    
    @Column(name = "shipping_phone")
    private String shippingPhone;
    
    @Column(name = "shipping_landmark")
    private String shippingLandmark;
    
    // Shiprocket integration fields
    @Column(name = "shiprocket_order_id")
    private String shiprocketOrderId;
    
    @Column(name = "shiprocket_shipment_id")
    private String shiprocketShipmentId;
    
    @Column(name = "awb_code")
    private String awbCode;
    
    @Column(name = "courier_name")
    private String courierName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "banned"})
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id")
    @JsonIgnoreProperties({"password"})
    private Seller seller;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"order"})
    private List<OrderItem> orderItems;

    // Constructors
    public Order() {
        this.createdAt = LocalDateTime.now();
    }

    public Order(String status, BigDecimal total, User user) {
        this.status = status;
        this.total = total;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Seller getSeller() { return seller; }
    public void setSeller(Seller seller) { this.seller = seller; }
    
    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    
    public Boolean getAdminApproved() { return adminApproved; }
    public void setAdminApproved(Boolean adminApproved) { this.adminApproved = adminApproved; }
    
    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }
    
    public Integer getPackageLength() { return packageLength; }
    public void setPackageLength(Integer packageLength) { this.packageLength = packageLength; }
    
    public Integer getPackageBreadth() { return packageBreadth; }
    public void setPackageBreadth(Integer packageBreadth) { this.packageBreadth = packageBreadth; }
    
    public Integer getPackageHeight() { return packageHeight; }
    public void setPackageHeight(Integer packageHeight) { this.packageHeight = packageHeight; }
    
    public LocalDateTime getShippedAt() { return shippedAt; }
    public void setShippedAt(LocalDateTime shippedAt) { this.shippedAt = shippedAt; }
    
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    
    public String getShippingCity() { return shippingCity; }
    public void setShippingCity(String shippingCity) { this.shippingCity = shippingCity; }
    
    public String getShippingState() { return shippingState; }
    public void setShippingState(String shippingState) { this.shippingState = shippingState; }
    
    public String getShippingPincode() { return shippingPincode; }
    public void setShippingPincode(String shippingPincode) { this.shippingPincode = shippingPincode; }
    
    public String getShippingPhone() { return shippingPhone; }
    public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }
    
    public String getShippingLandmark() { return shippingLandmark; }
    public void setShippingLandmark(String shippingLandmark) { this.shippingLandmark = shippingLandmark; }
    
    public String getShiprocketOrderId() { return shiprocketOrderId; }
    public void setShiprocketOrderId(String shiprocketOrderId) { this.shiprocketOrderId = shiprocketOrderId; }
    
    public String getShiprocketShipmentId() { return shiprocketShipmentId; }
    public void setShiprocketShipmentId(String shiprocketShipmentId) { this.shiprocketShipmentId = shiprocketShipmentId; }
    
    public String getAwbCode() { return awbCode; }
    public void setAwbCode(String awbCode) { this.awbCode = awbCode; }
    
    public String getCourierName() { return courierName; }
    public void setCourierName(String courierName) { this.courierName = courierName; }
}