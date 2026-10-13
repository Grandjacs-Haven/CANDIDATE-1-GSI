package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.ObservationType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ObservationResponseDto {
    private UUID id;
    private UUID encounterId;
    private ObservationType observationType;
    private String displayName;
    private BigDecimal numericValue;
    private String unit;
    private LocalDateTime effectiveAt;
}