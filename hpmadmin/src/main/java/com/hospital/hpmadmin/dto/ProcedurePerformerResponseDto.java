package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.ProcedurePerformerRole;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ProcedurePerformerResponseDto {
    private UUID id;
    private UUID procedureId;
    private UUID practitionerId;
    private ProcedurePerformerRole performerRole;
}