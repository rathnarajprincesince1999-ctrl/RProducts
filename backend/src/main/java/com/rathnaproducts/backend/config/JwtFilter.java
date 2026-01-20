package com.rathnaproducts.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // List of endpoints to skip JWT check
    private static final List<String> WHITELIST = List.of(
            "/api/auth/", // signup/login endpoints
            "/api/admin/", // admin endpoints
            "/api/categories/" // categories endpoints
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip JWT for public endpoints OR OPTIONS requests
        if (request.getMethod().equalsIgnoreCase("OPTIONS") ||
                path.startsWith("/api/auth") || path.startsWith("/api/admin") || 
                path.startsWith("/api/seller") || path.startsWith("/api/categories") || 
                path.startsWith("/api/products") || path.startsWith("/api/checkout") || 
                path.startsWith("/api/orders") || path.startsWith("/api/returns") || 
                path.startsWith("/uploads")) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.validateToken(token)) {
                String email = jwtUtil.extractEmail(token);
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(email, null, new ArrayList<>()));
            }
        } else {
            // Only block protected endpoints
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
            return;
        }

        chain.doFilter(request, response);
    }

}
