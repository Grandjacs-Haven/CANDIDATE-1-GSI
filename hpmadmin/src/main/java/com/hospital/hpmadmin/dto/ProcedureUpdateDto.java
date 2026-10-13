package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.ProcedureStatus;
import com.hospital.hpmadmin.model.ProcedureType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class ProcedureUpdateDto {

    private UUID encounterId;

    private ProcedureType procedureType;

    private ProcedureStatus status;

    private ZonedDateTime performedAt;

    private String notes;
}