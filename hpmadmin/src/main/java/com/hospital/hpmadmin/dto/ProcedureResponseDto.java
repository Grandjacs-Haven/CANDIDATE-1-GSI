package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.ProcedureStatus;
import com.hospital.hpmadmin.model.ProcedureType;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class ProcedureResponseDto {
    private UUID id;
    private UUID encounterId;
    private ProcedureType procedureType;
    private ProcedureStatus status;
    private ZonedDateTime performedAt;
    private String notes;
}