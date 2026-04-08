package com.rathnaproducts.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "replacements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Replacement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReplacementStatus status = ReplacementStatus.PENDING;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Column(name = "admin_notes")
    private String adminNotes;
    
    public enum ReplacementStatus {
        PENDING, APPROVED, REJECTED, COMPLETED
    }
}