package com.rathnaproducts.backend.dto;

import lombok.Data;

@Data
public class AdminResponse {
    private Long id;
    private String username;
    private String token;
}
