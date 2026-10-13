package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.ProcedureRequestDto;
import com.hospital.hpmadmin.dto.ProcedureResponseDto;
import com.hospital.hpmadmin.dto.ProcedureUpdateDto;
import com.hospital.hpmadmin.entity.Encounter;
import com.hospital.hpmadmin.entity.Procedure;
import com.hospital.hpmadmin.model.ProcedureStatus;
import com.hospital.hpmadmin.repository.EncounterRepository;
import com.hospital.hpmadmin.repository.ProcedureRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProcedureService {

    private final ProcedureRepository procedureRepository;
    private final EncounterRepository encounterRepository;

    public ProcedureResponseDto mapToResponse(Procedure procedure) {
        return ProcedureResponseDto.builder()
                .id(procedure.getId())
                .encounterId(procedure.getEncounter() != null ? procedure.getEncounter().getId() : null)
                .procedureType(procedure.getProcedureType())
                .status(procedure.getStatus())
                .performedAt(procedure.getPerformedAt())
                .notes(procedure.getNotes())
                .build();
    }

    public ProcedureResponseDto create(ProcedureRequestDto requestDto, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Creating procedure for encounter '{}' by actor '{}' (corrId '{}')", requestDto.getEncounterId(), actorId, corrId);

        Encounter encounter = encounterRepository.findById(requestDto.getEncounterId())
                .orElseThrow(() -> new EntityNotFoundException("Encounter not found: " + requestDto.getEncounterId()));

        Procedure procedure = new Procedure();
        procedure.setEncounter(encounter);
        procedure.setProcedureType(requestDto.getProcedureType());
        procedure.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : ProcedureStatus.PENDING);
        procedure.setPerformedAt(requestDto.getPerformedAt());
        procedure.setNotes(requestDto.getNotes());

        // Audit fields tracking
        procedure.setCreatedBy(actorId);
        procedure.setUpdatedBy(actorId);

        Procedure saved = procedureRepository.save(procedure);
        log.info("Successfully created procedure '{}' by actor '{}' (corrId '{}')", saved.getId(), actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProcedureResponseDto> findAll() {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching all procedures (corrId '{}')", corrId);

        return procedureRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProcedureResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching procedure by id: '{}' (corrId '{}')", id, corrId);

        Procedure procedure = getProcedureEntity(id);
        return mapToResponse(procedure);
    }

    @Transactional(readOnly = true)
    public List<ProcedureResponseDto> findByEncounterId(UUID encounterId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching procedures for encounter '{}' (corrId '{}')", encounterId, corrId);

        return procedureRepository.findByEncounter_Id(encounterId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProcedureResponseDto update(UUID id, ProcedureUpdateDto requestDto, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Updating procedure '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Procedure procedure = getProcedureEntity(id);

        if (requestDto.getProcedureType() != null) {
            procedure.setProcedureType(requestDto.getProcedureType());
        }
        if (requestDto.getStatus() != null) {
            procedure.setStatus(requestDto.getStatus());
        }
        if (requestDto.getPerformedAt() != null) {
            procedure.setPerformedAt(requestDto.getPerformedAt());
        }
        if (requestDto.getNotes() != null) {
            procedure.setNotes(requestDto.getNotes());
        }

        procedure.setUpdatedBy(actorId);

        Procedure updated = procedureRepository.save(procedure);
        log.info("Successfully updated procedure '{}' by actor '{}' (corrId '{}')", updated.getId(), actorId, corrId);

        return mapToResponse(updated);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Deleting procedure '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Procedure procedure = getProcedureEntity(id);
        procedureRepository.delete(procedure);

        log.info("Successfully deleted procedure '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);
    }

    private Procedure getProcedureEntity(UUID id) {
        return procedureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Procedure not found: " + id));
    }
}