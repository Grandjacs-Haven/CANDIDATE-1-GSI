package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.EncounterRequestDto;
import com.hospital.hpmadmin.dto.EncounterResponseDto;
import com.hospital.hpmadmin.entity.Encounter;
import com.hospital.hpmadmin.repository.AppointmentRepository;
import com.hospital.hpmadmin.repository.EncounterRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EncounterService {

    private final EncounterRepository encounterRepository;
    private final AppointmentRepository appointmentRepository;

    public EncounterResponseDto mapToResponse(Encounter encounter) {
        return EncounterResponseDto.builder()
                .id(encounter.getId())
                .encounterNumber(encounter.getEncounterNumber())
                .appointmentId(encounter.getAppointmentId())
                .status(encounter.getStatus() != null ? encounter.getStatus().name() : null)
                .encounterClass(encounter.getEncounterClass() != null ? encounter.getEncounterClass().name() : null)
                .encounterType(encounter.getEncounterType() != null ? encounter.getEncounterType().name() : null)
                .priority(encounter.getPriority() != null ? encounter.getPriority().name() : null)
                .actualStart(encounter.getActualStart())
                .actualEnd(encounter.getActualEnd())
                .build();
    }

    public EncounterResponseDto create(EncounterRequestDto requestDto, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Creating encounter '{}' for appointment '{}' by actor '{}' (corrId '{}')",
                requestDto.getEncounterNumber(), requestDto.getAppointmentId(), actorId, corrId);

        if (encounterRepository.existsByEncounterNumberIgnoreCase(requestDto.getEncounterNumber())) {
            log.warn("Encounter creation failed: Encounter number '{}' already exists (corrId '{}')", requestDto.getEncounterNumber(), corrId);
            throw new IllegalArgumentException("Encounter number already exists: " + requestDto.getEncounterNumber());
        }

        if (!appointmentRepository.existsById(requestDto.getAppointmentId())) {
            throw new EntityNotFoundException("Appointment not found: " + requestDto.getAppointmentId());
        }

        Encounter encounter = new Encounter();
        encounter.setEncounterNumber(requestDto.getEncounterNumber());
        encounter.setAppointmentId(requestDto.getAppointmentId());
        encounter.setStatus(requestDto.getStatus());
        encounter.setEncounterClass(requestDto.getEncounterClass());
        encounter.setEncounterType(requestDto.getEncounterType());
        encounter.setPriority(requestDto.getPriority());
        encounter.setActualStart(requestDto.getActualStart());
        encounter.setActualEnd(requestDto.getActualEnd());

        encounter.setCreatedBy(actorId);
        encounter.setUpdatedBy(actorId);

        Encounter saved = encounterRepository.save(encounter);
        log.info("Successfully created encounter '{}' (corrId '{}')", saved.getId(), corrId);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EncounterResponseDto> findByAppointmentIds(Set<UUID> appointmentIds) {
        if (appointmentIds == null || appointmentIds.isEmpty()) {
            return List.of();
        }
        return encounterRepository.findByAppointmentIdIn(appointmentIds).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EncounterResponseDto> findAll() {
        return encounterRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EncounterResponseDto findById(UUID id) {
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Encounter not found: " + id));
        return mapToResponse(encounter);
    }

    public EncounterResponseDto update(UUID id, EncounterRequestDto requestDto, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Updating encounter '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Encounter not found: " + id));

        if (requestDto.getAppointmentId() != null) {
            if (!appointmentRepository.existsById(requestDto.getAppointmentId())) {
                throw new EntityNotFoundException("Appointment not found: " + requestDto.getAppointmentId());
            }
            encounter.setAppointmentId(requestDto.getAppointmentId());
        }

        if (requestDto.getEncounterNumber() != null && !requestDto.getEncounterNumber().equalsIgnoreCase(encounter.getEncounterNumber())) {
            if (encounterRepository.existsByEncounterNumberIgnoreCase(requestDto.getEncounterNumber())) {
                throw new IllegalArgumentException("Encounter number already exists: " + requestDto.getEncounterNumber());
            }
            encounter.setEncounterNumber(requestDto.getEncounterNumber());
        }

        if (requestDto.getStatus() != null) {
            encounter.setStatus(requestDto.getStatus());
        }
        if (requestDto.getEncounterClass() != null) {
            encounter.setEncounterClass(requestDto.getEncounterClass());
        }
        if (requestDto.getEncounterType() != null) {
            encounter.setEncounterType(requestDto.getEncounterType());
        }
        if (requestDto.getPriority() != null) {
            encounter.setPriority(requestDto.getPriority());
        }
        if (requestDto.getActualStart() != null) {
            encounter.setActualStart(requestDto.getActualStart());
        }
        if (requestDto.getActualEnd() != null) {
            encounter.setActualEnd(requestDto.getActualEnd());
        }

        encounter.setUpdatedBy(actorId);

        Encounter updated = encounterRepository.save(encounter);
        log.info("Successfully updated encounter '{}' (corrId '{}')", id, corrId);
        return mapToResponse(updated);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Deleting encounter '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Encounter not found: " + id));
        encounterRepository.delete(encounter);
        log.info("Successfully deleted encounter '{}' (corrId '{}')", id, corrId);
    }
}