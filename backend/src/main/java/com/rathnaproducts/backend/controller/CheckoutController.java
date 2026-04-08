package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.dto.CheckoutRequest;
import com.rathnaproducts.backend.model.*;
import com.rathnaproducts.backend.repo.*;
import com.rathnaproducts.backend.service.ShiprocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CheckoutController {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final ShiprocketService shiprocketService;
    
    private static final String UPI_ID = "rathnaraj1234567890-5@okaxis";
    
    @GetMapping("/upi-details")
    public ResponseEntity<Map<String, String>> getUpiDetails() {
        return ResponseEntity.ok(Map.of("upiId", UPI_ID));
    }
    
    @PostMapping("/express")
    public ResponseEntity<Map<String, Object>> processExpressCheckout(
            @Valid @RequestBody CheckoutRequest request, 
            @RequestParam(required = false) String userEmail) {
        
        String email = userEmail;
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        List<Long> orderIds = new ArrayList<>();
        
        // Group items by seller and validate stock
        Map<Long, List<CheckoutRequest.CheckoutItem>> itemsBySeller = new HashMap<>();
        
        for (CheckoutRequest.CheckoutItem item : request.getItems()) {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                
                // Validate stock availability
                if (product.getStockQuantity() != null && product.getStockQuantity() < item.getQuantity()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Insufficient stock for product: " + product.getName() + 
                                ". Available: " + product.getStockQuantity() + ", Requested: " + item.getQuantity()
                    ));
                }
                
                // Check if product is enabled
                if (product.getEnabled() != null && !product.getEnabled()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Product is not available: " + product.getName()
                    ));
                }
                
                Long sellerId = product.getSeller() != null ? product.getSeller().getId() : null;
                itemsBySeller.computeIfAbsent(sellerId, k -> new ArrayList<>()).add(item);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Product not found with ID: " + item.getProductId()
                ));
            }
        }
        
        // Create separate orders for each seller
        for (Map.Entry<Long, List<CheckoutRequest.CheckoutItem>> entry : itemsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            List<CheckoutRequest.CheckoutItem> sellerItems = entry.getValue();
            
            // Calculate total for this seller
            BigDecimal sellerTotal = sellerItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Create order with EXPRESS mode
            Order order = new Order();
            order.setUser(user);
            order.setTotal(sellerTotal);
            order.setPaymentMethod(request.getPaymentMethod());
            order.setTransactionId(request.getTransactionId());
            order.setStatus("PROCESSING"); // Express orders start as PROCESSING
            order.setCreatedAt(LocalDateTime.now());
            
            // Set default package dimensions for Shiprocket
            order.setPackageWeight(0.5); // Default 500g
            order.setPackageLength(10);  // Default 10cm
            order.setPackageBreadth(10); // Default 10cm
            order.setPackageHeight(5);   // Default 5cm
            
            // Set shipping details
            if (request.getShippingDetails() != null) {
                order.setShippingAddress(request.getShippingDetails().getAddress());
                order.setShippingCity(request.getShippingDetails().getCity());
                order.setShippingState(request.getShippingDetails().getState());
                order.setShippingPincode(request.getShippingDetails().getPincode());
                order.setShippingPhone(request.getShippingDetails().getPhone());
                order.setShippingLandmark(request.getShippingDetails().getLandmark());
            }
            
            if (sellerId != null) {
                Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
                sellerOpt.ifPresent(order::setSeller);
            }
            
            Order savedOrder = orderRepository.save(order);
            
            // Create order items and reduce stock
            for (CheckoutRequest.CheckoutItem item : sellerItems) {
                Optional<Product> productOpt = productRepository.findById(item.getProductId());
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    
                    // Reduce stock quantity
                    if (product.getStockQuantity() != null) {
                        product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                        productRepository.save(product);
                    }
                    
                    OrderItem orderItem = new OrderItem(
                        savedOrder,
                        product,
                        item.getQuantity(),
                        item.getPrice()
                    );
                    orderItemRepository.save(orderItem);
                }
            }
            
            // ShipRocket integration for Express mode
            try {
                Map<String, Object> shipRocketResponse = shiprocketService.createShipment(savedOrder);
                if (shipRocketResponse != null && shipRocketResponse.containsKey("order_id")) {
                    savedOrder.setShiprocketOrderId(shipRocketResponse.get("order_id").toString());
                    if (shipRocketResponse.containsKey("shipment_id")) {
                        savedOrder.setShiprocketShipmentId(shipRocketResponse.get("shipment_id").toString());
                    }
                    if (shipRocketResponse.containsKey("awb_code")) {
                        savedOrder.setAwbCode(shipRocketResponse.get("awb_code").toString());
                    }
                    if (shipRocketResponse.containsKey("courier_name")) {
                        savedOrder.setCourierName(shipRocketResponse.get("courier_name").toString());
                    }
                    savedOrder.setStatus("SHIPPED");
                    orderRepository.save(savedOrder);
                    log.info("ShipRocket order created successfully: {}", shipRocketResponse.get("order_id"));
                } else {
                    log.warn("ShipRocket order creation failed for order: {}", savedOrder.getId());
                }
            } catch (Exception e) {
                log.error("ShipRocket integration failed for order: {} - {}", savedOrder.getId(), e.getMessage());
            }
            
            orderIds.add(savedOrder.getId());
        }
        
        return ResponseEntity.ok(Map.of(
            "orderIds", orderIds,
            "status", "SUCCESS",
            "message", "Express orders placed successfully. Automated processing initiated."
        ));
    }
    
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processCheckout(
            @Valid @RequestBody CheckoutRequest request, 
            @RequestParam(required = false) String userEmail) {
        
        String email = userEmail;
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        List<Long> orderIds = new ArrayList<>();
        
        // Group items by seller and validate stock
        Map<Long, List<CheckoutRequest.CheckoutItem>> itemsBySeller = new HashMap<>();
        
        for (CheckoutRequest.CheckoutItem item : request.getItems()) {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                
                // Validate stock availability
                if (product.getStockQuantity() != null && product.getStockQuantity() < item.getQuantity()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Insufficient stock for product: " + product.getName() + 
                                ". Available: " + product.getStockQuantity() + ", Requested: " + item.getQuantity()
                    ));
                }
                
                // Check if product is enabled
                if (product.getEnabled() != null && !product.getEnabled()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Product is not available: " + product.getName()
                    ));
                }
                
                Long sellerId = product.getSeller() != null ? product.getSeller().getId() : null;
                itemsBySeller.computeIfAbsent(sellerId, k -> new ArrayList<>()).add(item);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Product not found with ID: " + item.getProductId()
                ));
            }
        }
        
        // Create separate orders for each seller
        for (Map.Entry<Long, List<CheckoutRequest.CheckoutItem>> entry : itemsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            List<CheckoutRequest.CheckoutItem> sellerItems = entry.getValue();
            
            // Calculate total for this seller
            BigDecimal sellerTotal = sellerItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Create order
            Order order = new Order();
            order.setUser(user);
            order.setTotal(sellerTotal);
            order.setPaymentMethod(request.getPaymentMethod());
            order.setTransactionId(request.getTransactionId());
            order.setStatus("PENDING");
            order.setCreatedAt(LocalDateTime.now());
            
            // Set default package dimensions
            order.setPackageWeight(0.5);
            order.setPackageLength(10);
            order.setPackageBreadth(10);
            order.setPackageHeight(5);
            
            // Set shipping details
            if (request.getShippingDetails() != null) {
                order.setShippingAddress(request.getShippingDetails().getAddress());
                order.setShippingCity(request.getShippingDetails().getCity());
                order.setShippingState(request.getShippingDetails().getState());
                order.setShippingPincode(request.getShippingDetails().getPincode());
                order.setShippingPhone(request.getShippingDetails().getPhone());
                order.setShippingLandmark(request.getShippingDetails().getLandmark());
            }
            
            if (sellerId != null) {
                Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
                sellerOpt.ifPresent(order::setSeller);
            }
            
            Order savedOrder = orderRepository.save(order);
            
            // Create order items and reduce stock
            for (CheckoutRequest.CheckoutItem item : sellerItems) {
                Optional<Product> productOpt = productRepository.findById(item.getProductId());
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    
                    // Reduce stock quantity
                    if (product.getStockQuantity() != null) {
                        product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                        productRepository.save(product);
                    }
                    
                    OrderItem orderItem = new OrderItem(
                        savedOrder,
                        product,
                        item.getQuantity(),
                        item.getPrice()
                    );
                    orderItemRepository.save(orderItem);
                }
            }
            
            orderIds.add(savedOrder.getId());
        }
        
        return ResponseEntity.ok(Map.of(
            "orderIds", orderIds,
            "status", "SUCCESS",
            "message", "Orders placed successfully"
        ));
    }
}