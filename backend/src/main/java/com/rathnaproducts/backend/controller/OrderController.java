package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.model.Order;
import com.rathnaproducts.backend.model.User;
import com.rathnaproducts.backend.repo.OrderRepository;
import com.rathnaproducts.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/orders/user")
    public ResponseEntity<List<Order>> getUserOrders(@RequestParam(required = false) String userEmail) {
        if (userEmail == null || userEmail.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(userOpt.get());
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/orders/admin/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/orders/admin/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueData() {
        List<Order> deliveredOrders = orderRepository.findByStatusOrderByCreatedAtDesc("DELIVERED");
        
        BigDecimal totalRevenue = deliveredOrders.stream()
            .map(Order::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, Map<String, Object>> sellerRevenue = deliveredOrders.stream()
            .filter(order -> order.getSeller() != null)
            .collect(Collectors.groupingBy(
                order -> order.getSeller().getName() + " (" + order.getSeller().getEmail() + ")",
                Collectors.collectingAndThen(
                    Collectors.toList(),
                    orders -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("revenue", orders.stream().map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add));
                        data.put("orders", orders.size());
                        data.put("sellerName", orders.get(0).getSeller().getName());
                        return data;
                    }
                )
            ));
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalRevenue", totalRevenue);
        response.put("deliveredOrdersCount", deliveredOrders.size());
        response.put("sellerRevenue", sellerRevenue);
        response.put("deliveredOrders", deliveredOrders);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/orders/seller")
    public ResponseEntity<List<Order>> getSellerOrders(@RequestParam(required = false) String sellerEmail) {
        if (sellerEmail == null || sellerEmail.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Find seller by email and get their orders
        List<Order> orders = orderRepository.findAll().stream()
            .filter(order -> order.getSeller() != null && sellerEmail.equals(order.getSeller().getEmail()))
            .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
            .toList();
        return ResponseEntity.ok(orders);
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        String newStatus = request.get("status");
        order.setStatus(newStatus);
        
        // Set delivered date when status changes to DELIVERED
        if ("DELIVERED".equals(newStatus)) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }
    
    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id, @RequestParam(required = false) String userEmail) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        // Only allow cancellation if order is not shipped
        if ("SHIPPED".equals(order.getStatus()) || "DELIVERED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            return ResponseEntity.badRequest().build();
        }
        
        order.setStatus("CANCELLED");
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }
    
    @PutMapping("/orders/{id}/reject")
    public ResponseEntity<Order> rejectOrder(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        // Only allow rejection if order is pending or confirmed
        if ("SHIPPED".equals(order.getStatus()) || "DELIVERED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus()) || "REJECTED".equals(order.getStatus())) {
            return ResponseEntity.badRequest().build();
        }
        
        order.setStatus("REJECTED");
        order.setRejectionReason(request.get("reason"));
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }
}