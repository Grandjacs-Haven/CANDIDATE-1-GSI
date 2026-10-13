package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.ClinicalNoteRequestDto;
import com.hospital.hpmadmin.dto.ClinicalNoteResponseDto;
import com.hospital.hpmadmin.service.ClinicalNoteService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clinical-notes")
@RequiredArgsConstructor
public class ClinicalNoteController {

    private final ClinicalNoteService clinicalNoteService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClinicalNoteResponseDto create(
            @Valid @RequestBody ClinicalNoteRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return clinicalNoteService.create(requestDto, actorId);
    }

    @GetMapping("/{id}")
    public ClinicalNoteResponseDto findById(@PathVariable UUID id) {
        return clinicalNoteService.findById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<ClinicalNoteResponseDto> findByPatientId(@PathVariable UUID patientId) {
        return clinicalNoteService.findByPatientId(patientId);
    }

    @PutMapping("/{id}")
    public ClinicalNoteResponseDto update(
            @PathVariable UUID id,
            @Valid @RequestBody ClinicalNoteRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return clinicalNoteService.update(id, requestDto, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        clinicalNoteService.delete(id, actorId);
    }
}