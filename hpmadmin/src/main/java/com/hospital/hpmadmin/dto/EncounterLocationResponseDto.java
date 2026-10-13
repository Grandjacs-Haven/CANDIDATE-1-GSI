package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.EncounterLocationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class EncounterLocationResponseDto {
    private UUID id;
    private UUID encounterId;
    private UUID wardId;
    private UUID roomId;
    private UUID bedId;
    private EncounterLocationStatus status;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
}