package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.EncounterLocationRequestDto;
import com.hospital.hpmadmin.dto.EncounterLocationResponseDto;
import com.hospital.hpmadmin.dto.EncounterLocationUpdateDto;
import com.hospital.hpmadmin.entity.EncounterLocation;
import com.hospital.hpmadmin.service.EncounterLocationService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/encounter-history")
@RequiredArgsConstructor
public class EncounterLocationController {

    private final EncounterLocationService encounterLocationService;

    @PostMapping("/encounters/{encounterId}/locations")
    @ResponseStatus(HttpStatus.CREATED)
    public EncounterLocationResponseDto createLocation(
            @PathVariable UUID encounterId,
            @Valid @RequestBody EncounterLocationRequestDto requestDto,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {

        // Map DTO to Entity for the service layer
        EncounterLocation locationEntity = new EncounterLocation();
        locationEntity.setWardId(requestDto.getWardId());
        locationEntity.setRoomId(requestDto.getRoomId());
        locationEntity.setBedId(requestDto.getBedId());
        if (requestDto.getStatus() != null) {
            locationEntity.setStatus(requestDto.getStatus());
        }
        locationEntity.setPeriodStart(requestDto.getPeriodStart());
        locationEntity.setPeriodEnd(requestDto.getPeriodEnd());

        return encounterLocationService.create(encounterId, locationEntity, actorId);
    }

    @GetMapping("/encounter-locations")
    public List<EncounterLocationResponseDto> getAllLocations() {
        return encounterLocationService.findAll();
    }

    @GetMapping("/encounters/{encounterId}/locations")
    public List<EncounterLocationResponseDto> getLocationsByEncounter(
            @PathVariable UUID encounterId) {
        return encounterLocationService.findByEncounter(encounterId);
    }

    @GetMapping("/encounter-locations/{id}")
    public EncounterLocationResponseDto getLocationById(
            @PathVariable UUID id) {
        return encounterLocationService.findById(id);
    }

    @PutMapping("/encounter-locations/{id}/encounters/{encounterId}")
    public EncounterLocationResponseDto updateLocation(
            @PathVariable UUID id,
            @PathVariable UUID encounterId,
            @Valid @RequestBody EncounterLocationUpdateDto requestDto,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {


        return encounterLocationService.update(id, encounterId, requestDto, actorId);
    }

    @DeleteMapping("/encounter-locations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLocation(
            @PathVariable UUID id,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {
        encounterLocationService.delete(id, actorId);
    }
}