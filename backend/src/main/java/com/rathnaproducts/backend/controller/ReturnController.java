package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.model.Return;
import com.rathnaproducts.backend.model.Order;
import com.rathnaproducts.backend.model.Product;
import com.rathnaproducts.backend.repo.ReturnRepository;
import com.rathnaproducts.backend.repo.OrderRepository;
import com.rathnaproducts.backend.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReturnController {

    @Autowired
    private ReturnRepository returnRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/returns")
    public ResponseEntity<Return> createReturn(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            String userEmail = request.get("userEmail").toString();
            String reason = request.get("reason").toString();

            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Order order = orderOpt.get();

            // Check if order is delivered
            if (!"DELIVERED".equals(order.getStatus())) {
                return ResponseEntity.badRequest().build();
            }

            // Check if user owns the order
            if (order.getUser() == null || !order.getUser().getEmail().equals(userEmail)) {
                return ResponseEntity.badRequest().build();
            }

            // Check if return already exists for this order
            List<Return> existingReturns = returnRepository.findByOrderOrderByCreatedAtDesc(order);
            if (!existingReturns.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Create return for the first returnable product in the order
            Product returnableProduct = null;
            if (order.getOrderItems() != null) {
                for (var item : order.getOrderItems()) {
                    if (item.getProduct() != null && Boolean.TRUE.equals(item.getProduct().getReturnable())) {
                        returnableProduct = item.getProduct();
                        break;
                    }
                }
            }

            if (returnableProduct == null) {
                return ResponseEntity.badRequest().build();
            }

            Return returnRequest = new Return();
            returnRequest.setOrder(order);
            returnRequest.setProduct(returnableProduct);
            returnRequest.setType("RETURN");
            returnRequest.setReason(reason);
            returnRequest.setStatus("PENDING");

            Return savedReturn = returnRepository.save(returnRequest);
            return ResponseEntity.ok(savedReturn);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/returns/request")
    public ResponseEntity<Return> requestReturn(@RequestBody Map<String, Object> request) {
        Long orderId = Long.valueOf(request.get("orderId").toString());
        Long productId = Long.valueOf(request.get("productId").toString());
        String type = request.get("type").toString(); // RETURN or REPLACEMENT
        String reason = request.get("reason").toString();

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        Optional<Product> productOpt = productRepository.findById(productId);

        if (orderOpt.isEmpty() || productOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Order order = orderOpt.get();
        Product product = productOpt.get();

        // Check if order is delivered
        if (!"DELIVERED".equals(order.getStatus())) {
            return ResponseEntity.badRequest().build();
        }

        // Check return/replacement eligibility
        if (order.getDeliveredAt() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        long daysSinceDelivery = ChronoUnit.DAYS.between(order.getDeliveredAt(), LocalDateTime.now());
        
        if ("RETURN".equals(type)) {
            if (!product.getReturnable() || daysSinceDelivery > product.getReturnDays()) {
                return ResponseEntity.badRequest().build();
            }
        } else if ("REPLACEMENT".equals(type)) {
            if (!product.getReplaceable() || daysSinceDelivery > product.getReplacementDays()) {
                return ResponseEntity.badRequest().build();
            }
        }

        Return returnRequest = new Return();
        returnRequest.setOrder(order);
        returnRequest.setProduct(product);
        returnRequest.setType(type);
        returnRequest.setReason(reason);
        returnRequest.setStatus("PENDING");

        Return savedReturn = returnRepository.save(returnRequest);
        return ResponseEntity.ok(savedReturn);
    }

    @GetMapping("/returns/user")
    public ResponseEntity<List<Return>> getUserReturns(@RequestParam String userEmail) {
        List<Return> returns = returnRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
        return ResponseEntity.ok(returns);
    }

    @GetMapping("/returns/seller")
    public ResponseEntity<List<Return>> getSellerReturns(@RequestParam String sellerEmail) {
        List<Return> returns = returnRepository.findBySellerEmailOrderByCreatedAtDesc(sellerEmail);
        return ResponseEntity.ok(returns);
    }

    @GetMapping("/returns/all")
    public ResponseEntity<List<Return>> getAllReturns() {
        List<Return> returns = returnRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(returns);
    }

    @PutMapping("/returns/{id}/status")
    public ResponseEntity<Return> updateReturnStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Return> returnOpt = returnRepository.findById(id);
        if (returnOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Return returnRequest = returnOpt.get();
        returnRequest.setStatus(request.get("status"));
        Return updatedReturn = returnRepository.save(returnRequest);
        return ResponseEntity.ok(updatedReturn);
    }
}