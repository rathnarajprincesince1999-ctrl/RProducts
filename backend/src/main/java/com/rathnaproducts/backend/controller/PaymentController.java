package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.dto.PaymentRequest;
import com.rathnaproducts.backend.model.Payment;
import com.rathnaproducts.backend.model.User;
import com.rathnaproducts.backend.repo.PaymentRepository;
import com.rathnaproducts.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/payments/user")
    public ResponseEntity<List<Payment>> getUserPayments(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Payment> payments = paymentRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(payments);
    }

    @PostMapping("/payments")
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentRequest request, Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Payment payment = new Payment(
            request.getType(), 
            request.getLastFour(), 
            request.getExpiryDate(), 
            request.getUpiId(), 
            userOpt.get()
        );
        Payment savedPayment = paymentRepository.save(payment);
        return ResponseEntity.ok(savedPayment);
    }

    @PutMapping("/payments/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody PaymentRequest request, Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        
        if (userOpt.isEmpty() || paymentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Payment payment = paymentOpt.get();
        if (!payment.getUser().equals(userOpt.get())) {
            return ResponseEntity.status(403).build();
        }
        
        payment.setType(request.getType());
        payment.setLastFour(request.getLastFour());
        payment.setExpiryDate(request.getExpiryDate());
        payment.setUpiId(request.getUpiId());
        Payment savedPayment = paymentRepository.save(payment);
        return ResponseEntity.ok(savedPayment);
    }

    @DeleteMapping("/payments/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        
        if (userOpt.isEmpty() || paymentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Payment payment = paymentOpt.get();
        if (!payment.getUser().equals(userOpt.get())) {
            return ResponseEntity.status(403).build();
        }
        
        paymentRepository.delete(payment);
        return ResponseEntity.ok().build();
    }
}