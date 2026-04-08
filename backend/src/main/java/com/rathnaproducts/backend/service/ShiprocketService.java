package com.rathnaproducts.backend.service;

import com.rathnaproducts.backend.config.ShiprocketConfig;
import com.rathnaproducts.backend.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ShiprocketService {

    @Autowired
    private ShiprocketConfig shiprocketConfig;

    @Autowired
    private RestTemplate restTemplate;

    private String authToken;

    public String authenticate() {
        try {
            String url = shiprocketConfig.getBaseUrl() + "/auth/login";
            
            Map<String, String> loginData = new HashMap<>();
            loginData.put("email", shiprocketConfig.getEmail());
            loginData.put("password", shiprocketConfig.getPassword());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(loginData, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                this.authToken = (String) response.getBody().get("token");
                return this.authToken;
            }
        } catch (Exception e) {
            System.err.println("Shiprocket authentication failed: " + e.getMessage());
        }
        return null;
    }

    public Map<String, Object> createShipment(Order order) {
        try {
            // Validate order data first
            if (order == null) {
                throw new RuntimeException("Order is null");
            }
            if (order.getUser() == null) {
                throw new RuntimeException("Order user is null");
            }
            if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
                throw new RuntimeException("Order has no items");
            }
            
            if (authToken == null) {
                System.out.println("Authenticating with Shiprocket...");
                String token = authenticate();
                if (token == null) {
                    throw new RuntimeException("Failed to authenticate with Shiprocket");
                }
            }

            String url = shiprocketConfig.getBaseUrl() + "/orders/create/adhoc";
            
            Map<String, Object> shipmentData = buildShipmentData(order);
            System.out.println("Creating Shiprocket shipment for order: " + order.getId());
            System.out.println("Shipment data: " + shipmentData);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(authToken);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(shipmentData, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            System.out.println("Shiprocket response status: " + response.getStatusCode());
            System.out.println("Shiprocket response body: " + response.getBody());

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && responseBody.containsKey("order_id")) {
                    System.out.println("Shiprocket shipment created successfully with order_id: " + responseBody.get("order_id"));
                    return responseBody;
                } else {
                    System.err.println("Shiprocket response missing order_id: " + responseBody);
                    return null;
                }
            } else {
                System.err.println("Shiprocket API returned non-OK status: " + response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            System.err.println("Shiprocket shipment creation failed: " + e.getMessage());
            e.printStackTrace();
            
            // Retry with fresh authentication
            try {
                System.out.println("Retrying with fresh authentication...");
                String token = authenticate();
                if (token == null) {
                    System.err.println("Failed to re-authenticate with Shiprocket");
                    return null;
                }
                
                String url = shiprocketConfig.getBaseUrl() + "/orders/create/adhoc";
                Map<String, Object> shipmentData = buildShipmentData(order);
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(authToken);
                
                HttpEntity<Map<String, Object>> request = new HttpEntity<>(shipmentData, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
                
                System.out.println("Retry response status: " + response.getStatusCode());
                System.out.println("Retry response body: " + response.getBody());
                
                if (response.getStatusCode() == HttpStatus.OK) {
                    Map<String, Object> responseBody = response.getBody();
                    if (responseBody != null && responseBody.containsKey("order_id")) {
                        System.out.println("Shiprocket shipment created successfully on retry with order_id: " + responseBody.get("order_id"));
                        return responseBody;
                    } else {
                        System.err.println("Shiprocket retry response missing order_id: " + responseBody);
                        return null;
                    }
                } else {
                    System.err.println("Shiprocket retry API returned non-OK status: " + response.getStatusCode());
                    return null;
                }
            } catch (Exception retryException) {
                System.err.println("Shiprocket retry failed: " + retryException.getMessage());
                retryException.printStackTrace();
                return null;
            }
        }
    }

    public boolean cancelShipment(String shiprocketOrderId) {
        try {
            if (authToken == null) {
                authenticate();
            }

            String url = shiprocketConfig.getBaseUrl() + "/orders/cancel";
            
            Map<String, Object> cancelData = new HashMap<>();
            cancelData.put("ids", List.of(Integer.parseInt(shiprocketOrderId)));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(authToken);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(cancelData, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            return response.getStatusCode() == HttpStatus.NO_CONTENT;
        } catch (Exception e) {
            System.err.println("Shiprocket shipment cancellation failed: " + e.getMessage());
        }
        return false;
    }

    public Map<String, Object> trackShipment(String awbCode) {
        try {
            if (authToken == null) {
                authenticate();
            }

            String url = shiprocketConfig.getBaseUrl() + "/courier/track/awb/" + awbCode;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(authToken);
            
            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (Exception e) {
            System.err.println("Shiprocket tracking failed: " + e.getMessage());
        }
        return null;
    }

    private Map<String, Object> buildShipmentData(Order order) {
        Map<String, Object> data = new HashMap<>();
        
        try {
            // Validate required order data
            if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
                throw new RuntimeException("Order has no items");
            }
            
            // Order basic info
            data.put("order_id", "RATHNA-" + order.getId());
            data.put("order_date", order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            data.put("pickup_location", shiprocketConfig.getPickupLocation());
            
            // Billing details (customer info)
            String customerName = order.getUser().getName() != null ? order.getUser().getName() : "Customer";
            String[] nameParts = customerName.split(" ", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "User";
            
            // Ensure required fields are not empty
            String shippingAddress = order.getShippingAddress();
            if (shippingAddress == null || shippingAddress.trim().isEmpty()) {
                shippingAddress = "Address not provided";
            }
            
            String shippingCity = order.getShippingCity();
            if (shippingCity == null || shippingCity.trim().isEmpty()) {
                shippingCity = "Chennai";
            }
            
            String shippingState = order.getShippingState();
            if (shippingState == null || shippingState.trim().isEmpty()) {
                shippingState = "Tamil Nadu";
            }
            
            String shippingPincode = order.getShippingPincode();
            if (shippingPincode == null || shippingPincode.trim().isEmpty()) {
                shippingPincode = "600001";
            }
            
            String shippingPhone = order.getShippingPhone();
            if (shippingPhone == null || shippingPhone.trim().isEmpty()) {
                shippingPhone = "9999999999";
            }
            
            data.put("billing_customer_name", firstName);
            data.put("billing_last_name", lastName);
            data.put("billing_address", shippingAddress);
            data.put("billing_address_2", order.getShippingLandmark() != null ? order.getShippingLandmark() : "");
            data.put("billing_city", shippingCity);
            data.put("billing_pincode", shippingPincode);
            data.put("billing_state", shippingState);
            data.put("billing_country", "India");
            data.put("billing_email", order.getUser().getEmail());
            data.put("billing_phone", shippingPhone);
            
            // Shipping same as billing
            data.put("shipping_is_billing", true);
            data.put("shipping_customer_name", "");
            data.put("shipping_last_name", "");
            data.put("shipping_address", "");
            data.put("shipping_address_2", "");
            data.put("shipping_city", "");
            data.put("shipping_pincode", "");
            data.put("shipping_country", "");
            data.put("shipping_state", "");
            data.put("shipping_email", "");
            data.put("shipping_phone", "");
            
            // Order items
            List<Map<String, Object>> orderItems = order.getOrderItems().stream().map(item -> {
                Map<String, Object> itemData = new HashMap<>();
                itemData.put("name", item.getProduct().getName());
                itemData.put("sku", "RATHNA-" + item.getProduct().getId());
                itemData.put("units", item.getQuantity());
                itemData.put("selling_price", item.getPrice().doubleValue());
                itemData.put("discount", 0);
                itemData.put("tax", 0);
                itemData.put("hsn", "");
                return itemData;
            }).collect(Collectors.toList());
            
            data.put("order_items", orderItems);
            
            // Payment and charges - Fix payment method check
            String paymentMethod = order.getPaymentMethod();
            if (paymentMethod == null) {
                paymentMethod = "COD";
            }
            data.put("payment_method", paymentMethod.equalsIgnoreCase("COD") ? "COD" : "Prepaid");
            data.put("shipping_charges", 0);
            data.put("giftwrap_charges", 0);
            data.put("transaction_charges", 0);
            data.put("total_discount", 0);
            data.put("sub_total", order.getTotal().doubleValue());
            
            // Package dimensions and weight - Ensure minimum values
            int length = order.getPackageLength() != null && order.getPackageLength() > 0 ? order.getPackageLength() : 15;
            int breadth = order.getPackageBreadth() != null && order.getPackageBreadth() > 0 ? order.getPackageBreadth() : 10;
            int height = order.getPackageHeight() != null && order.getPackageHeight() > 0 ? order.getPackageHeight() : 8;
            double weight = order.getPackageWeight() != null && order.getPackageWeight() > 0 ? order.getPackageWeight() : 0.5;
            
            data.put("length", length);
            data.put("breadth", breadth);
            data.put("height", height);
            data.put("weight", weight);
            
            // Additional fields for better integration
            data.put("channel_id", "");
            data.put("comment", "Order from RATHNA Products - " + (order.getSeller() != null ? order.getSeller().getName() : "Direct Sale"));
            
            System.out.println("Built shipment data successfully for order: " + order.getId());
            return data;
            
        } catch (Exception e) {
            System.err.println("Error building shipment data for order " + order.getId() + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to build shipment data: " + e.getMessage());
        }
    }
}