package com.hospital.hpmadmin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class ClinicalNoteRequestDto {

    @NotNull(message = "Encounter ID is required.")
    private UUID encounterId;

    @NotBlank(message = "Note type is required.")
    private String noteType;

    private String title;

    @NotBlank(message = "Note content is required.")
    private String noteContent;

    @NotNull(message = "Author user ID is required.")
    private UUID authoredByUserId;

    private ZonedDateTime authoredAt; // Defaults to current time if null
}