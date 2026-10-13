package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.ProcedurePerformerRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ProcedurePerformerUpdateDto {

    private UUID procedureId;

    private UUID practitionerId;

    private ProcedurePerformerRole performerRole;
}