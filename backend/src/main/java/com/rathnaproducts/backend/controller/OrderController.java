package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.model.Order;
import com.rathnaproducts.backend.model.User;
import com.rathnaproducts.backend.repo.OrderRepository;
import com.rathnaproducts.backend.repo.UserRepository;
import com.rathnaproducts.backend.service.ShiprocketService;
import com.rathnaproducts.backend.service.NotificationService;
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
    
    @Autowired
    private ShiprocketService shiprocketService;
    
    @Autowired
    private NotificationService notificationService;

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
        
        // Check if admin approval is required for seller actions
        if (!"PENDING".equals(newStatus) && (order.getAdminApproved() == null || !order.getAdminApproved())) {
            return ResponseEntity.badRequest().build();
        }
        
        order.setStatus(newStatus);
        
        // Set delivered date when status changes to DELIVERED
        if ("DELIVERED".equals(newStatus)) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }
    
    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(@PathVariable Long id, @RequestParam(required = false) String userEmail) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        // Only allow cancellation if order is not delivered
        if ("DELIVERED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order cannot be cancelled"));
        }
        
        // Cancel Shiprocket shipment if exists
        boolean shiprocketCancelled = false;
        if (order.getShiprocketOrderId() != null) {
            try {
                shiprocketCancelled = shiprocketService.cancelShipment(order.getShiprocketOrderId());
            } catch (Exception e) {
                System.err.println("Failed to cancel Shiprocket shipment: " + e.getMessage());
            }
        }
        
        order.setStatus("CANCELLED");
        Order updatedOrder = orderRepository.save(order);
        
        // Send notifications to seller and admin
        notificationService.notifyOrderCancellation(updatedOrder);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order cancelled successfully");
        response.put("order", updatedOrder);
        response.put("shiprocketCancelled", shiprocketCancelled);
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/orders/{id}/admin-approve")
    public ResponseEntity<Map<String, Object>> adminApproveOrder(@PathVariable Long id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        // Only allow approval if order is pending or processing
        if (!"PENDING".equals(order.getStatus()) && !"PROCESSING".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order not in pending or processing status"));
        }
        
        order.setAdminApproved(true);
        order.setStatus("APPROVED");
        Order updatedOrder = orderRepository.save(order);
        
        // Notify seller that order is approved
        notificationService.notifyOrderApproval(updatedOrder);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Order approved successfully. Seller can now add package details.",
            "order", updatedOrder
        ));
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
    
    @PutMapping("/orders/{id}/package-details")
    public ResponseEntity<Map<String, Object>> addPackageDetails(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        // Only allow if order is approved by admin
        if (!"APPROVED".equals(order.getStatus()) || !Boolean.TRUE.equals(order.getAdminApproved())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order not approved by admin"));
        }
        
        // Set package details
        order.setPackageWeight(((Number) request.get("packageWeight")).doubleValue());
        order.setPackageLength(((Number) request.get("packageLength")).intValue());
        order.setPackageBreadth(((Number) request.get("packageBreadth")).intValue());
        order.setPackageHeight(((Number) request.get("packageHeight")).intValue());
        order.setStatus("PACKAGE_READY");
        
        Order updatedOrder = orderRepository.save(order);
        
        // Automatically create shipment after package details are added
        try {
            updatedOrder.setShippedAt(LocalDateTime.now());
            updatedOrder.setStatus("SHIPPED");
            updatedOrder = orderRepository.save(updatedOrder);
            
            Map<String, Object> shiprocketResponse = shiprocketService.createShipment(updatedOrder);
            
            if (shiprocketResponse != null && shiprocketResponse.containsKey("order_id")) {
                // Update order with Shiprocket details
                updatedOrder.setShiprocketOrderId(shiprocketResponse.get("order_id").toString());
                if (shiprocketResponse.containsKey("shipment_id")) {
                    updatedOrder.setShiprocketShipmentId(shiprocketResponse.get("shipment_id").toString());
                }
                if (shiprocketResponse.containsKey("awb_code")) {
                    updatedOrder.setAwbCode(shiprocketResponse.get("awb_code").toString());
                }
                if (shiprocketResponse.containsKey("courier_name")) {
                    updatedOrder.setCourierName(shiprocketResponse.get("courier_name").toString());
                }
                
                updatedOrder = orderRepository.save(updatedOrder);
                
                // Notify about successful shipment
                notificationService.notifyOrderShipped(updatedOrder);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Package details added and order automatically shipped via Shiprocket",
                    "order", updatedOrder,
                    "shiprocket", shiprocketResponse
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Package details added and order shipped locally",
                    "order", updatedOrder,
                    "warning", "Shiprocket integration failed"
                ));
            }
        } catch (Exception e) {
            System.err.println("Auto-shipping error: " + e.getMessage());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Package details added, but auto-shipping failed",
                "order", updatedOrder,
                "error", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/orders/{id}/ship")
    public ResponseEntity<Map<String, Object>> shipOrder(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        // Only allow shipping if order is admin approved and ready
        if (!Boolean.TRUE.equals(order.getAdminApproved()) || !"APPROVED".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Order must be admin approved before shipping"
            ));
        }
        
        // Set package details
        order.setPackageWeight(((Number) request.get("packageWeight")).doubleValue());
        order.setPackageLength(((Number) request.get("packageLength")).intValue());
        order.setPackageBreadth(((Number) request.get("packageBreadth")).intValue());
        order.setPackageHeight(((Number) request.get("packageHeight")).intValue());
        order.setShippedAt(LocalDateTime.now());
        order.setStatus("SHIPPED");
        
        Order updatedOrder = orderRepository.save(order);
        
        // Create Shiprocket shipment
        try {
            Map<String, Object> shiprocketResponse = shiprocketService.createShipment(updatedOrder);
            
            if (shiprocketResponse != null && shiprocketResponse.containsKey("order_id")) {
                // Update order with Shiprocket details
                updatedOrder.setShiprocketOrderId(shiprocketResponse.get("order_id").toString());
                if (shiprocketResponse.containsKey("shipment_id")) {
                    updatedOrder.setShiprocketShipmentId(shiprocketResponse.get("shipment_id").toString());
                }
                if (shiprocketResponse.containsKey("awb_code")) {
                    updatedOrder.setAwbCode(shiprocketResponse.get("awb_code").toString());
                }
                if (shiprocketResponse.containsKey("courier_name")) {
                    updatedOrder.setCourierName(shiprocketResponse.get("courier_name").toString());
                }
                
                updatedOrder = orderRepository.save(updatedOrder);
                
                // Notify about successful shipment
                notificationService.notifyOrderShipped(updatedOrder);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order shipped successfully via Shiprocket Express Mode",
                    "order", updatedOrder,
                    "shiprocket", shiprocketResponse
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order shipped locally (Shiprocket integration failed)",
                    "order", updatedOrder,
                    "warning", "Shiprocket integration failed"
                ));
            }
        } catch (Exception e) {
            System.err.println("Shiprocket shipping error: " + e.getMessage());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order shipped locally (Shiprocket error: " + e.getMessage() + ")",
                "order", updatedOrder,
                "error", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/orders/{id}/tracking")
    public ResponseEntity<Map<String, Object>> getOrderTracking(@PathVariable Long id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        Map<String, Object> trackingData = new HashMap<>();
        trackingData.put("orderId", order.getId());
        trackingData.put("status", order.getStatus());
        trackingData.put("createdAt", order.getCreatedAt());
        trackingData.put("awbCode", order.getAwbCode());
        trackingData.put("courierName", order.getCourierName());
        trackingData.put("shippedAt", order.getShippedAt());
        trackingData.put("shiprocketOrderId", order.getShiprocketOrderId());
        
        // If AWB code exists, get live tracking from Shiprocket
        if (order.getAwbCode() != null) {
            try {
                Map<String, Object> shiprocketTracking = shiprocketService.trackShipment(order.getAwbCode());
                if (shiprocketTracking != null) {
                    trackingData.put("liveTracking", shiprocketTracking);
                }
            } catch (Exception e) {
                System.err.println("Failed to get live tracking: " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok(trackingData);
    }
    
    @PutMapping("/orders/{id}/cancel-shipment")
    public ResponseEntity<Map<String, Object>> cancelShipment(@PathVariable Long id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        if (order.getShiprocketOrderId() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "No Shiprocket shipment found for this order"
            ));
        }
        
        try {
            boolean cancelled = shiprocketService.cancelShipment(order.getShiprocketOrderId());
            if (cancelled) {
                order.setStatus("CANCELLED");
                order.setAwbCode(null);
                order.setCourierName(null);
                order.setShiprocketOrderId(null);
                order.setShiprocketShipmentId(null);
                orderRepository.save(order);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Shipment cancelled successfully"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Failed to cancel shipment with Shiprocket"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "Error cancelling shipment: " + e.getMessage()
            ));
        }
    }
}