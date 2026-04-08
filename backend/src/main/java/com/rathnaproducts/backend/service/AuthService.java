package com.rathnaproducts.backend.service;

import com.rathnaproducts.backend.config.JwtUtil;
import com.rathnaproducts.backend.dto.*;
import com.rathnaproducts.backend.mapper.UserMapper;
import com.rathnaproducts.backend.model.User;
import com.rathnaproducts.backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserResponse signup(SignupRequest request) {
        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("Invalid email format");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Assign next user ID
        Long maxUserId = userRepository.findMaxUserId().orElse(0L);
        user.setUserId(maxUserId + 1);
        
        UserResponse response = userMapper.toResponse(userRepository.save(user));
        response.setToken(jwtUtil.generateToken(user.getEmail()));
        return response;
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        UserResponse response = userMapper.toResponse(user);
        response.setToken(jwtUtil.generateToken(user.getEmail()));
        return response;
    }

    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Email not found"));
        
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        // In production, send email with reset link containing the token
        // Email service implementation would go here
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset email sent successfully");
        return response;
    }

    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
            .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
        
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }
        
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return response;
    }
}
