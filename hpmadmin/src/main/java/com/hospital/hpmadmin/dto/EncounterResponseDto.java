package com.hospital.hpmadmin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class EncounterResponseDto {
    private UUID id;
    private String encounterNumber;
    private UUID appointmentId;
    private String status;
    private String encounterClass;
    private String encounterType;
    private String priority;
    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;
}