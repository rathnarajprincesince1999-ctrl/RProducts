package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.model.Order;
import com.rathnaproducts.backend.repo.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class WebhookController {

    private final OrderRepository orderRepository;

    @PostMapping("/shiprocket/tracking")
    public ResponseEntity<String> handleShipRocketWebhook(@RequestBody Map<String, Object> payload) {
        try {
            log.info("Received ShipRocket webhook: {}", payload);
            
            String awb = (String) payload.get("awb");
            String currentStatus = (String) payload.get("current_status");
            Object srOrderIdObj = payload.get("sr_order_id");
            
            if (awb != null && srOrderIdObj != null) {
                String srOrderId = srOrderIdObj.toString();
                
                // Find order by ShipRocket order ID or AWB
                Optional<Order> orderOpt = orderRepository.findByShiprocketOrderIdOrAwbCode(srOrderId, awb);
                
                if (orderOpt.isPresent()) {
                    Order order = orderOpt.get();
                    
                    // Update order status based on ShipRocket status
                    String newStatus = mapShipRocketStatus(currentStatus);
                    if (newStatus != null && !newStatus.equals(order.getStatus())) {
                        order.setStatus(newStatus);
                        
                        // Set AWB if not already set
                        if (order.getAwbCode() == null && awb != null) {
                            order.setAwbCode(awb);
                        }
                        
                        // Set courier name if available
                        String courierName = (String) payload.get("courier_name");
                        if (courierName != null && order.getCourierName() == null) {
                            order.setCourierName(courierName);
                        }
                        
                        orderRepository.save(order);
                        log.info("Updated order {} status to {} via webhook", order.getId(), newStatus);
                    }
                } else {
                    log.warn("Order not found for ShipRocket ID: {} or AWB: {}", srOrderId, awb);
                }
            }
            
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Error processing ShipRocket webhook", e);
            return ResponseEntity.ok("OK"); // Always return OK to prevent retries
        }
    }
    
    private String mapShipRocketStatus(String shipRocketStatus) {
        if (shipRocketStatus == null) return null;
        
        return switch (shipRocketStatus.toUpperCase()) {
            case "PICKED UP", "SHIPPED", "IN TRANSIT" -> "SHIPPED";
            case "OUT FOR DELIVERY" -> "OUT_FOR_DELIVERY";
            case "DELIVERED" -> "DELIVERED";
            case "RTO INITIATED", "RTO IN TRANSIT" -> "RETURNING";
            case "RTO DELIVERED" -> "RETURNED";
            case "CANCELLED" -> "CANCELLED";
            default -> null; // Don't update for unknown statuses
        };
    }
}