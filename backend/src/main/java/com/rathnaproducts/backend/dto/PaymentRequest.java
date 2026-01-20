package com.rathnaproducts.backend.dto;

public class PaymentRequest {
    private String type;
    private String lastFour;
    private String expiryDate;
    private String upiId;

    // Constructors
    public PaymentRequest() {}

    public PaymentRequest(String type, String lastFour, String expiryDate, String upiId) {
        this.type = type;
        this.lastFour = lastFour;
        this.expiryDate = expiryDate;
        this.upiId = upiId;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLastFour() { return lastFour; }
    public void setLastFour(String lastFour) { this.lastFour = lastFour; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
}