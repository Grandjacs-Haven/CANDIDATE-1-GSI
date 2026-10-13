package com.hospital.hpmadmin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserPrivilegeResponseDto {
    private UUID id;
    private UUID userId;
    private String privilegeName;
    private String scope;
}