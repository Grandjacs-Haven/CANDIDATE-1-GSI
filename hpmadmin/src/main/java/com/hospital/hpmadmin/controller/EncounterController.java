package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.EncounterRequestDto;
import com.hospital.hpmadmin.dto.EncounterResponseDto;
import com.hospital.hpmadmin.service.EncounterService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/encounters")
@RequiredArgsConstructor
public class EncounterController {

    private final EncounterService encounterService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EncounterResponseDto createEncounter(
            @Valid @RequestBody EncounterRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return encounterService.create(requestDto, actorId);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<EncounterResponseDto> getAllEncounters() {
        return encounterService.findAll();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public EncounterResponseDto getEncounterById(@PathVariable UUID id) {
        return encounterService.findById(id);
    }

    @GetMapping("/by-appointments")
    @ResponseStatus(HttpStatus.OK)
    public List<EncounterResponseDto> getEncountersByAppointments(
            @RequestParam Set<UUID> appointmentIds
    ) {
        return encounterService.findByAppointmentIds(appointmentIds);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public EncounterResponseDto updateEncounter(
            @PathVariable UUID id,
            @Valid @RequestBody EncounterRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return encounterService.update(id, requestDto, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEncounter(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        encounterService.delete(id, actorId);
    }
}