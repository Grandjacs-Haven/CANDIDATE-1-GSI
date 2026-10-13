package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.EncounterClass;
import com.hospital.hpmadmin.model.EncounterPriority;
import com.hospital.hpmadmin.model.EncounterStatus;
import com.hospital.hpmadmin.model.EncounterType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data

public class EncounterRequestDto {

    @NotBlank(message = "Encounter number is mandatory")
    private String encounterNumber;

    @NotNull(message = "Appointment ID is mandatory")
    private UUID appointmentId;

    @NotNull(message = "Encounter status is mandatory")
    private EncounterStatus status;

    @NotNull(message = "Encounter class is mandatory")
    private EncounterClass encounterClass;

    private EncounterType encounterType;

    @NotNull(message = "Encounter priority is mandatory")
    private EncounterPriority priority;

    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;
}