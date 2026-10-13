package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.ProcedurePerformerRequestDto;
import com.hospital.hpmadmin.dto.ProcedurePerformerResponseDto;
import com.hospital.hpmadmin.dto.ProcedurePerformerUpdateDto;
import com.hospital.hpmadmin.entity.Practitioner;
import com.hospital.hpmadmin.entity.Procedure;
import com.hospital.hpmadmin.entity.ProcedurePerformer;
import com.hospital.hpmadmin.model.ProcedurePerformerRole;
import com.hospital.hpmadmin.repository.PractitionerRepository;
import com.hospital.hpmadmin.repository.ProcedurePerformerRepository;
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
public class ProcedurePerformerService {

    private final ProcedurePerformerRepository performerRepository;
    private final ProcedureRepository procedureRepository;
    private final PractitionerRepository practitionerRepository;

    public ProcedurePerformerResponseDto mapToResponse(ProcedurePerformer performer) {
        return ProcedurePerformerResponseDto.builder()
                .id(performer.getId())
                .procedureId(performer.getProcedure() != null ? performer.getProcedure().getId() : null)
                .practitionerId(performer.getPractitioner() != null ? performer.getPractitioner().getId() : null)
                .performerRole(performer.getPerformerRole())
                .build();
    }

    public ProcedurePerformerResponseDto create(
            ProcedurePerformerRequestDto requestDto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        Procedure procedure = procedureRepository.findById(requestDto.getProcedureId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Procedure not found: " + requestDto.getProcedureId()));

        Practitioner practitioner = practitionerRepository
                .findById(requestDto.getPractitionerId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Practitioner not found: " + requestDto.getPractitionerId()));

        if (performerRepository.existsByProcedure_IdAndPractitioner_Id(
                requestDto.getProcedureId(), requestDto.getPractitionerId())) {
            throw new IllegalStateException(
                    "This practitioner is already assigned to the procedure.");
        }

        ProcedurePerformer performer = new ProcedurePerformer();
        performer.setProcedure(procedure);
        performer.setPractitioner(practitioner);
        performer.setPerformerRole(requestDto.getPerformerRole());

        // Audit fields tracking
        performer.setCreatedBy(actorId);
        performer.setUpdatedBy(actorId);

        ProcedurePerformer saved = performerRepository.save(performer);

        log.info(
                "Assigned practitioner '{}' to procedure '{}' with role '{}' by actor '{}' (corrId '{}')",
                requestDto.getPractitionerId(), requestDto.getProcedureId(), requestDto.getPerformerRole(), actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ProcedurePerformerResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ProcedurePerformer performer = getById(id);

        log.info(
                "Retrieved procedure performer '{}' (corrId '{}')",
                id, corrId);

        return mapToResponse(performer);
    }

    @Transactional(readOnly = true)
    public List<ProcedurePerformerResponseDto> findByProcedureId(UUID procedureId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        if (!procedureRepository.existsById(procedureId)) {
            throw new EntityNotFoundException(
                    "Procedure not found: " + procedureId);
        }

        List<ProcedurePerformerResponseDto> performers =
                performerRepository.findByProcedure_Id(procedureId).stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());

        log.info(
                "Retrieved '{}' performers for procedure '{}' (corrId '{}')",
                performers.size(), procedureId, corrId);

        return performers;
    }

    public ProcedurePerformerResponseDto update(
            UUID id,
            ProcedurePerformerUpdateDto requestDto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ProcedurePerformer performer = getById(id);

        Procedure procedure = procedureRepository.findById(requestDto.getProcedureId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Procedure not found: " + requestDto.getProcedureId()));

        Practitioner practitioner = practitionerRepository
                .findById(requestDto.getPractitionerId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Practitioner not found: " + requestDto.getPractitionerId()));

        // Check if changing to this procedure/practitioner combo conflicts with an existing record (excluding current id)
        boolean existsConflict = performerRepository.existsByProcedure_IdAndPractitioner_Id(
                requestDto.getProcedureId(), requestDto.getPractitionerId());

        if (existsConflict && (!performer.getProcedure().getId().equals(requestDto.getProcedureId())
                || !performer.getPractitioner().getId().equals(requestDto.getPractitionerId()))) {
            throw new IllegalStateException("This practitioner is already assigned to the procedure.");
        }

        performer.setProcedure(procedure);
        performer.setPractitioner(practitioner);
        performer.setPerformerRole(requestDto.getPerformerRole());
        performer.setUpdatedBy(actorId);

        ProcedurePerformer saved = performerRepository.save(performer);

        log.info(
                "Updated procedure performer assignment '{}' by actor '{}' (corrId '{}')",
                id, actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProcedurePerformerResponseDto> findByPractitionerId(UUID practitionerId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        List<ProcedurePerformerResponseDto> performers =
                performerRepository.findByPractitioner_Id(practitionerId).stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());

        log.info(
                "Retrieved '{}' procedure assignments for practitioner '{}' (corrId '{}')",
                performers.size(), practitionerId, corrId);

        return performers;
    }

    public ProcedurePerformerResponseDto updateRole(
            UUID id,
            ProcedurePerformerRole role,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ProcedurePerformer performer = getById(id);

        performer.setPerformerRole(role);
        performer.setUpdatedBy(actorId);

        ProcedurePerformer saved = performerRepository.save(performer);

        log.info(
                "Updated role for procedure performer '{}' to '{}' by actor '{}' (corrId '{}')",
                id, role, actorId, corrId);

        return mapToResponse(saved);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ProcedurePerformer performer = getById(id);

        UUID practitionerId = performer.getPractitioner().getId();
        UUID procedureId = performer.getProcedure().getId();

        performerRepository.delete(performer);

        log.info(
                "Removed practitioner '{}' from procedure '{}' by actor '{}' (corrId '{}')",
                practitionerId, procedureId, actorId, corrId);
    }

    private ProcedurePerformer getById(UUID id) {
        return performerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Procedure performer not found: " + id));
    }
}