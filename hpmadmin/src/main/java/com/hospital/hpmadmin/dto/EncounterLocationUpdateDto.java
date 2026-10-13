package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.EncounterLocationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EncounterLocationUpdateDto {


    private UUID wardId;

    private UUID roomId;

    private UUID bedId;

    private EncounterLocationStatus status;


    private LocalDateTime periodStart;

    private LocalDateTime periodEnd;
}