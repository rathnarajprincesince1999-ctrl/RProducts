package com.rathnaproducts.backend.mapper;

import com.rathnaproducts.backend.dto.AdminResponse;
import com.rathnaproducts.backend.model.Admin;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AdminMapper {
    @Mapping(target = "token", ignore = true)
    AdminResponse toResponse(Admin admin);
}
