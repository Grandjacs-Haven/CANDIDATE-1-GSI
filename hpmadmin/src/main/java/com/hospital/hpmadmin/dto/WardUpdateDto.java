package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.WardStatus;
import com.hospital.hpmadmin.model.WardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WardUpdateDto {


    private String code;


    private String name;


    private WardType wardType;

    private WardStatus status;

    private String description;
}