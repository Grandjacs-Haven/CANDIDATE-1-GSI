package com.hospital.hpmadmin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class ClinicalNoteResponseDto {
    private UUID id;
    private UUID encounterId;
    private String noteType;
    private String title;
    private String noteContent;
    private UUID authoredByUserId;
    private ZonedDateTime authoredAt;
    private ZonedDateTime createdAt;
    private UUID createdBy;
}