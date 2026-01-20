package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.dto.CheckoutRequest;
import com.rathnaproducts.backend.model.*;
import com.rathnaproducts.backend.repo.*;
import lombok.RequiredArgsConstructor;
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
public class CheckoutController {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    
    private static final String UPI_ID = "rathnaraj1234567890-5@okaxis";
    
    @GetMapping("/upi-details")
    public ResponseEntity<Map<String, String>> getUpiDetails() {
        return ResponseEntity.ok(Map.of("upiId", UPI_ID));
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
        
        // Group items by seller
        Map<Long, List<CheckoutRequest.CheckoutItem>> itemsBySeller = new HashMap<>();
        
        for (CheckoutRequest.CheckoutItem item : request.getItems()) {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                Long sellerId = product.getSeller() != null ? product.getSeller().getId() : null;
                itemsBySeller.computeIfAbsent(sellerId, k -> new ArrayList<>()).add(item);
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
            
            if (sellerId != null) {
                Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
                sellerOpt.ifPresent(order::setSeller);
            }
            
            Order savedOrder = orderRepository.save(order);
            
            // Create order items
            for (CheckoutRequest.CheckoutItem item : sellerItems) {
                Optional<Product> productOpt = productRepository.findById(item.getProductId());
                if (productOpt.isPresent()) {
                    OrderItem orderItem = new OrderItem(
                        savedOrder,
                        productOpt.get(),
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