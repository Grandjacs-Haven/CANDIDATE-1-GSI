package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.WardStatus;
import com.hospital.hpmadmin.model.WardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WardRequestDto {

    @NotBlank(message = "Ward code is required")
    private String code;

    @NotBlank(message = "Ward name is required")
    private String name;

    @NotNull(message = "Ward type is required")
    private WardType wardType;

    @NotNull(message = "Ward status is required")
    private WardStatus status;

    private String description;
}