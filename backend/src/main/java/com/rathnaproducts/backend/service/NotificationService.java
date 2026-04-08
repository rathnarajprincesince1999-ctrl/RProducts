package com.rathnaproducts.backend.service;

import com.rathnaproducts.backend.model.Order;
import com.rathnaproducts.backend.model.Admin;
import com.rathnaproducts.backend.repo.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private AdminRepository adminRepository;

    public void notifyOrderCancellation(Order order) {
        // Notify seller
        if (order.getSeller() != null) {
            System.out.println("NOTIFICATION: Order #" + order.getId() + " has been cancelled by user " + order.getUser().getEmail());
            System.out.println("Seller: " + order.getSeller().getEmail() + " - " + order.getSeller().getName());
        }
        
        // Notify all admins
        List<Admin> admins = adminRepository.findAll();
        for (Admin admin : admins) {
            System.out.println("NOTIFICATION: Admin " + admin.getUsername() + " - Order #" + order.getId() + " cancelled by user " + order.getUser().getEmail());
        }
        
        // Log shipment cancellation status
        if (order.getShiprocketOrderId() != null) {
            System.out.println("NOTIFICATION: Shiprocket shipment for order #" + order.getId() + " has been automatically cancelled");
        }
    }

    public void notifyOrderApproval(Order order) {
        // Notify seller that order is approved and ready for package details
        if (order.getSeller() != null) {
            System.out.println("NOTIFICATION: Order #" + order.getId() + " approved by admin. Seller " + order.getSeller().getEmail() + " can now add package details.");
        }
    }

    public void notifyOrderShipped(Order order) {
        // Notify user that order has been shipped
        System.out.println("NOTIFICATION: Order #" + order.getId() + " has been shipped to user " + order.getUser().getEmail());
        
        if (order.getAwbCode() != null) {
            System.out.println("Tracking Code: " + order.getAwbCode() + " via " + order.getCourierName());
        }
    }
}