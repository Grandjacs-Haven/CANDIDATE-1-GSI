package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.PatientRequestDto;
import com.hospital.hpmadmin.dto.PatientResponseDto;
import com.hospital.hpmadmin.service.PatientService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public PatientResponseDto create(
            @Valid @RequestBody PatientRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return patientService.create(requestDto, actorId);
    }

    @GetMapping("/{id}")
    public PatientResponseDto findById(@PathVariable UUID id) {
        return patientService.findById(id);
    }

    @GetMapping("/number/{patientNumber}")

    public PatientResponseDto findByPatientNumber(@PathVariable String patientNumber) {
        return patientService.findByPatientNumber(patientNumber);
    }

    @GetMapping
    public List<PatientResponseDto> findAll() {
        return patientService.findAll();
    }

    @PutMapping("/{id}")
    public PatientResponseDto update(
            @PathVariable UUID id,
            @Valid @RequestBody PatientRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return patientService.update(id, requestDto, actorId);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        patientService.delete(id, actorId);
    }
}