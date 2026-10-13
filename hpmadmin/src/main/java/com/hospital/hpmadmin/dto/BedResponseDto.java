package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.BedStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class BedResponseDto {
    private UUID id;
    private UUID roomId;
    private String roomName; // Optional, if available on Room entity
    private String bedNumber;
    private BedStatus operationalStatus;
    private String description;
}