package com.rathnaproducts.backend.dto;

public class AddressRequest {
    private String type;
    private String fullAddress;

    // Constructors
    public AddressRequest() {}

    public AddressRequest(String type, String fullAddress) {
        this.type = type;
        this.fullAddress = fullAddress;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFullAddress() { return fullAddress; }
    public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }
}