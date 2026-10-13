package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.ObservationResponseDto;
import com.hospital.hpmadmin.dto.ObservationUpdateDto;
import com.hospital.hpmadmin.entity.Encounter;
import com.hospital.hpmadmin.entity.Observation;
import com.hospital.hpmadmin.model.ObservationType;
import com.hospital.hpmadmin.repository.EncounterRepository;
import com.hospital.hpmadmin.repository.ObservationRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ObservationService {

    private final ObservationRepository observationRepository;
    private final EncounterRepository encounterRepository;

    public ObservationResponseDto mapToResponse(Observation observation) {
        return ObservationResponseDto.builder()
                .id(observation.getId())
                .encounterId(observation.getEncounter() != null ? observation.getEncounter().getId() : null)
                .observationType(observation.getObservationType())
                .displayName(observation.getDisplayName())
                .numericValue(observation.getNumericValue())
                .unit(observation.getUnit())
                .effectiveAt(observation.getEffectiveAt())
                .build();
    }

    public ObservationResponseDto recordObservation(UUID encounterId, ObservationType type, BigDecimal value, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Recording observation type '{}' for encounter '{}' by actor '{}' (corrId '{}')", type, encounterId, actorId, corrId);

        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new EntityNotFoundException("Encounter not found: " + encounterId));

        Observation observation = new Observation();
        observation.setEncounter(encounter);
        observation.setObservationType(type);
        observation.setDisplayName(type.getDisplayName());
        observation.setNumericValue(value);
        observation.setUnit(type.getDefaultUnit());
        observation.setEffectiveAt(LocalDateTime.now());

        // Populate audit tracking fields from the actor header
        observation.setCreatedBy(actorId);
        observation.setUpdatedBy(actorId);

        Observation saved = observationRepository.save(observation);
        log.info("Successfully recorded observation '{}' by actor '{}' (corrId '{}')", saved.getId(), actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ObservationResponseDto> findByEncounter(UUID encounterId, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching observations for encounter '{}' requested by actor '{}' (corrId '{}')", encounterId, actorId, corrId);

        if (!encounterRepository.existsById(encounterId)) {
            throw new EntityNotFoundException("Encounter not found: " + encounterId);
        }

        return observationRepository.findByEncounter_Id(encounterId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ObservationResponseDto findById(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching observation by id '{}' requested by actor '{}' (corrId '{}')", id, actorId, corrId);

        Observation observation = observationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Observation not found: " + id));

        return mapToResponse(observation);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Deleting observation '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Observation observation = observationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Observation not found: " + id));

        observationRepository.delete(observation);
        log.info("Successfully deleted observation '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);
    }

    public ObservationResponseDto updateObservation(UUID id, ObservationUpdateDto dto, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Updating observation '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Observation observation = observationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Observation not found: " + id));

        if (dto.getObservationType() != null) {
            observation.setObservationType(dto.getObservationType());
            observation.setDisplayName(dto.getObservationType().getDisplayName());
            observation.setUnit(dto.getObservationType().getDefaultUnit());
        }

        if (dto.getNumericValue() != null) {
            observation.setNumericValue(dto.getNumericValue());
        }

        // Update audit field
        observation.setUpdatedBy(actorId);

        Observation updated = observationRepository.save(observation);
        log.info("Successfully updated observation '{}' by actor '{}' (corrId '{}')", updated.getId(), actorId, corrId);

        return mapToResponse(updated);
    }
}