package com.rathnaproducts.backend.dto;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private Long userId;
    private String email;
    private String name;
    private String token;
}
