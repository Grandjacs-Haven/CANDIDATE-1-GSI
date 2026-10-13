package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.EncounterLocationResponseDto;
import com.hospital.hpmadmin.dto.EncounterLocationUpdateDto;
import com.hospital.hpmadmin.entity.Bed;
import com.hospital.hpmadmin.entity.Encounter;
import com.hospital.hpmadmin.entity.EncounterLocation;
import com.hospital.hpmadmin.entity.Room;
import com.hospital.hpmadmin.entity.Ward;
import com.hospital.hpmadmin.model.BedStatus;
import com.hospital.hpmadmin.model.EncounterLocationStatus;
import com.hospital.hpmadmin.repository.BedRepository;
import com.hospital.hpmadmin.repository.EncounterLocationRepository;
import com.hospital.hpmadmin.repository.EncounterRepository;
import com.hospital.hpmadmin.repository.RoomRepository;
import com.hospital.hpmadmin.repository.WardRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EncounterLocationService {

    private final EncounterLocationRepository encounterLocationRepository;
    private final EncounterRepository encounterRepository;
    private final WardRepository wardRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;

    // Helper method to convert Entity -> DTO (DRY Principle)
    public EncounterLocationResponseDto mapToResponse(EncounterLocation location) {
        return EncounterLocationResponseDto.builder()
                .id(location.getId())
                .encounterId(location.getEncounter() != null ? location.getEncounter().getId() : null)
                .wardId(location.getWardId())
                .roomId(location.getRoomId())
                .bedId(location.getBedId())
                .status(location.getStatus())
                .periodStart(location.getPeriodStart())
                .periodEnd(location.getPeriodEnd())
                .build();
    }

    public EncounterLocationResponseDto create(
            UUID encounterId,
            EncounterLocation request,
            UUID actorId) {

        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Encounter encounter = getEncounter(encounterId);

        validateLocation(request, null);

        request.setId(null);
        request.setEncounter(encounter);

        // Set actor tracking auditing fields on create
        request.setCreatedBy(actorId);
        request.setUpdatedBy(actorId);

        EncounterLocation saved = encounterLocationRepository.save(request);

        log.info(
                "Created encounter location '{}' for encounter '{}' in ward '{}' by actor '{}' (corrId '{}')",
                saved.getId(),
                encounterId,
                saved.getWardId(),
                actorId,
                corrId
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EncounterLocationResponseDto> findAll() {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        List<EncounterLocation> locations = encounterLocationRepository.findAll();

        log.info(
                "Retrieved '{}' encounter locations (corrId '{}')",
                locations.size(), corrId
        );

        return locations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EncounterLocationResponseDto> findByEncounter(UUID encounterId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        getEncounter(encounterId);

        List<EncounterLocation> locations =
                encounterLocationRepository
                        .findByEncounter_IdOrderByPeriodStartAsc(encounterId);

        log.info(
                "Retrieved '{}' locations for encounter '{}' (corrId '{}')",
                locations.size(), encounterId, corrId
        );

        return locations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EncounterLocationResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        EncounterLocation location = getLocation(id);

        log.info(
                "Retrieved encounter location '{}' for encounter '{}' (corrId '{}')",
                location.getId(),
                location.getEncounter().getId(),
                corrId
        );

        return mapToResponse(location);
    }

    public EncounterLocationResponseDto update(
            UUID id,
            UUID encounterId,
            EncounterLocationUpdateDto request,
            UUID actorId) {

        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        EncounterLocation location = getLocation(id);
        Encounter encounter = getEncounter(encounterId);

        // 1. Field-by-field conditional updates to protect existing data from null overwrites
        if (request.getWardId() != null) {
            location.setWardId(request.getWardId());
        }
        if (request.getRoomId() != null) {
            location.setRoomId(request.getRoomId());
        }
        if (request.getBedId() != null) {
            location.setBedId(request.getBedId());
        }
        if (request.getStatus() != null) {
            location.setStatus(request.getStatus());
        }
        if (request.getPeriodStart() != null) {
            location.setPeriodStart(request.getPeriodStart());
        }

        // 2. Business logic rules for periodEnd and status
        if (location.getStatus() == EncounterLocationStatus.COMPLETED) {
            // If completed, pull timestamp from the encounter if periodEnd isn't explicitly provided
            if (request.getPeriodEnd() != null) {
                location.setPeriodEnd(request.getPeriodEnd());
            } else if (encounter.getActualEnd() != null) {
                location.setPeriodEnd(encounter.getActualEnd());
            } else {
                // Fallback or validation rule if encounter hasn't ended yet
                throw new IllegalArgumentException("Encounter has no end time recorded to complete this location.");
            }
        } else {
            // Active or other statuses cannot have a period end
            location.setPeriodEnd(null);
        }

        location.setEncounter(encounter);

        // Optional custom validation check using your method
        // validateLocation(location, id);

        // Update tracking audit field
        location.setUpdatedBy(actorId);

        EncounterLocation saved = encounterLocationRepository.save(location);

        log.info(
                "Updated encounter location '{}' for encounter '{}' by actor '{}' (corrId '{}')",
                saved.getId(), encounterId, actorId, corrId
        );

        return mapToResponse(saved);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        EncounterLocation location = getLocation(id);

        UUID encounterId = location.getEncounter().getId();

        encounterLocationRepository.delete(location);

        log.info(
                "Deleted encounter location '{}' for encounter '{}' by actor '{}' (corrId '{}')",
                id, encounterId, actorId, corrId
        );
    }

    private void validateLocation(
            EncounterLocation request,
            UUID excludedLocationId) {

        if (request.getWardId() == null) {
            throw new IllegalArgumentException("Ward ID is required.");
        }

        Ward ward = wardRepository.findById(request.getWardId())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Ward not found: " + request.getWardId()));

        Room room = null;

        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "Room not found: " + request.getRoomId()));

            if (!Objects.equals(room.getWard().getId(), ward.getId())) {
                throw new IllegalArgumentException(
                        "The selected room does not belong to the selected ward.");
            }
        }

        if (request.getBedId() != null) {
            if (room == null) {
                throw new IllegalArgumentException(
                        "A room ID is required when a bed ID is supplied.");
            }

            Bed bed = bedRepository.findById(request.getBedId())
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "Bed not found: " + request.getBedId()));

            if (!Objects.equals(bed.getRoom().getId(), room.getId())) {
                throw new IllegalArgumentException(
                        "The selected bed does not belong to the selected room.");
            }

            if (request.getStatus() == EncounterLocationStatus.ACTIVE
                    && bed.getBedStatus() != BedStatus.READY) {
                throw new IllegalStateException(
                        "The selected bed is not operationally ready.");
            }
        }

        if (request.getPeriodStart() == null) {
            throw new IllegalArgumentException("Location period start is required.");
        }

        if (request.getPeriodEnd() != null
                && request.getPeriodEnd().isBefore(request.getPeriodStart())) {
            throw new IllegalArgumentException(
                    "Location period end cannot be before its start.");
        }

        if (request.getStatus() == EncounterLocationStatus.COMPLETED
                && request.getPeriodEnd() == null) {
            throw new IllegalArgumentException(
                    "A completed encounter location requires a period end.");
        }

        if (request.getStatus() == EncounterLocationStatus.ACTIVE
                && request.getPeriodEnd() != null) {
            throw new IllegalArgumentException(
                    "An active encounter location cannot have a period end.");
        }

        if (request.getStatus() == EncounterLocationStatus.ACTIVE) {
            UUID encId = request.getEncounter() == null
                    ? null
                    : request.getEncounter().getId();

            if (encId != null) {
                validateActiveAssignment(encId, request.getBedId(), excludedLocationId);
            }
        }
    }

    private void validateActiveAssignment(
            UUID encounterId,
            UUID bedId,
            UUID excludedLocationId) {

        boolean encounterHasAnotherActiveLocation =
                excludedLocationId == null
                        ? encounterLocationRepository
                        .existsByEncounter_IdAndStatus(
                                encounterId,
                                EncounterLocationStatus.ACTIVE)
                        : encounterLocationRepository
                        .existsByEncounter_IdAndStatusAndIdNot(
                                encounterId,
                                EncounterLocationStatus.ACTIVE,
                                excludedLocationId);

        if (encounterHasAnotherActiveLocation) {
            throw new IllegalStateException(
                    "This encounter already has an active location. Complete it before adding another.");
        }

        if (bedId != null) {
            boolean bedHasAnotherActiveAssignment =
                    excludedLocationId == null
                            ? encounterLocationRepository
                            .existsByBedIdAndStatus(
                                    bedId,
                                    EncounterLocationStatus.ACTIVE)
                            : encounterLocationRepository
                            .existsByBedIdAndStatusAndIdNot(
                                    bedId,
                                    EncounterLocationStatus.ACTIVE,
                                    excludedLocationId);

            if (bedHasAnotherActiveAssignment) {
                throw new IllegalStateException(
                        "The selected bed is already assigned to another active encounter.");
            }
        }
    }

    private Encounter getEncounter(UUID id) {
        return encounterRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Encounter not found: " + id));
    }

    private EncounterLocation getLocation(UUID id) {
        return encounterLocationRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Encounter location not found: " + id));
    }
}