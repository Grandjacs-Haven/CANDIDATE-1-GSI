package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.WardStatus;
import com.hospital.hpmadmin.model.WardType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class WardResponseDto {
    private UUID id;
    private String code;
    private String name;
    private WardType wardType;
    private WardStatus status;
    private String description;
}