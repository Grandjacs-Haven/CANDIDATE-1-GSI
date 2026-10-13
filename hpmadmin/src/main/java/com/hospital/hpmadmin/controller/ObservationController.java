package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.ObservationRequestDto;
import com.hospital.hpmadmin.dto.ObservationResponseDto;
import com.hospital.hpmadmin.dto.ObservationUpdateDto;
import com.hospital.hpmadmin.service.ObservationService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/observation")
@RequiredArgsConstructor
public class ObservationController {

    private final ObservationService observationService;

    @PostMapping("/encounters/{encounterId}/observations")
    @ResponseStatus(HttpStatus.CREATED)
    public ObservationResponseDto recordObservation(
            @PathVariable UUID encounterId,
            @Valid @RequestBody ObservationRequestDto requestDto,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {

        return observationService.recordObservation(
                encounterId,
                requestDto.getObservationType(),
                requestDto.getNumericValue(),
                actorId
        );
    }

    @GetMapping("/encounters/{encounterId}/observations")
    @ResponseStatus(HttpStatus.OK)
    public List<ObservationResponseDto> getObservationsByEncounter(
            @PathVariable UUID encounterId,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {

        return observationService.findByEncounter(encounterId, actorId);
    }

    @GetMapping("/observations/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ObservationResponseDto getObservationById(
            @PathVariable UUID id,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {

        return observationService.findById(id, actorId);
    }

    @DeleteMapping("/observations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteObservation(
            @PathVariable UUID id,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {

        observationService.delete(id, actorId);
    }

    @PatchMapping("/observations/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ObservationResponseDto updateObservation(
            @PathVariable UUID id,
            @Valid @RequestBody ObservationUpdateDto requestDto,
            @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {

        return observationService.updateObservation(id, requestDto, actorId);
    }
}