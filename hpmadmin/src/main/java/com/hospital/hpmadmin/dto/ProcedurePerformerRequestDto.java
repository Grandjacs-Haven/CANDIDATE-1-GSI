package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.ProcedurePerformerRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ProcedurePerformerRequestDto {

    @NotNull(message = "Procedure ID is required.")
    private UUID procedureId;

    @NotNull(message = "Practitioner ID is required.")
    private UUID practitionerId;

    @NotNull(message = "Performer role is required.")
    private ProcedurePerformerRole performerRole;
}