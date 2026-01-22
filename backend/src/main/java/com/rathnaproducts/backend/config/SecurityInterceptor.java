package com.rathnaproducts.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SecurityInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        
        // Skip security checks for public endpoints
        if (isPublicEndpoint(requestURI, request.getMethod())) {
            return true;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // Check if user is authenticated
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return false;
        }

        // Role-based access control
        if (requestURI.startsWith("/api/admin/")) {
            if (!hasRole(auth, "ADMIN")) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Admin access required");
                return false;
            }
        } else if (requestURI.startsWith("/api/seller/")) {
            if (!hasRole(auth, "SELLER")) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Seller access required");
                return false;
            }
        }

        return true;
    }

    private boolean isPublicEndpoint(String uri, String method) {
        return uri.equals("/api/auth/signup") || 
               uri.equals("/api/auth/login") ||
               (uri.startsWith("/api/categories") && "GET".equals(method)) ||
               (uri.startsWith("/api/products") && "GET".equals(method)) ||
               uri.startsWith("/uploads/");
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}