package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.ClinicalNoteRequestDto;
import com.hospital.hpmadmin.dto.ClinicalNoteResponseDto;
import com.hospital.hpmadmin.entity.Appointment;
import com.hospital.hpmadmin.entity.ClinicalNote;
import com.hospital.hpmadmin.entity.Encounter;
import com.hospital.hpmadmin.repository.AppointmentRepository;
import com.hospital.hpmadmin.repository.ClinicalNoteRepository;
import com.hospital.hpmadmin.repository.EncounterRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ClinicalNoteService {

    private final ClinicalNoteRepository clinicalNoteRepository;
    private final EncounterRepository encounterRepository;
    private final AppointmentRepository appointmentRepository;

    public ClinicalNoteResponseDto mapToResponse(ClinicalNote clinicalNote) {
        return ClinicalNoteResponseDto.builder()
                .id(clinicalNote.getId())
                .encounterId(clinicalNote.getEncounter() != null ? clinicalNote.getEncounter().getId() : null)
                .noteType(clinicalNote.getNoteType())
                .title(clinicalNote.getTitle())
                .noteContent(clinicalNote.getNoteContent())
                .authoredByUserId(clinicalNote.getAuthoredByUserId())
                .authoredAt(clinicalNote.getAuthoredAt())
                .createdAt(clinicalNote.getCreatedAt())
                .createdBy(clinicalNote.getCreatedBy())
                .build();
    }

    public ClinicalNoteResponseDto create(
            ClinicalNoteRequestDto requestDto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        Encounter encounter = encounterRepository.findById(requestDto.getEncounterId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Encounter not found: " + requestDto.getEncounterId()));

        ClinicalNote clinicalNote = new ClinicalNote();
        clinicalNote.setEncounter(encounter);
        clinicalNote.setNoteType(requestDto.getNoteType());
        clinicalNote.setTitle(requestDto.getTitle());
        clinicalNote.setNoteContent(requestDto.getNoteContent());
        clinicalNote.setAuthoredByUserId(requestDto.getAuthoredByUserId());
        clinicalNote.setAuthoredAt(requestDto.getAuthoredAt() != null ? requestDto.getAuthoredAt() : ZonedDateTime.now());

        // Audit fields tracking
        clinicalNote.setCreatedBy(actorId);
        clinicalNote.setUpdatedBy(actorId);

        ClinicalNote saved = clinicalNoteRepository.save(clinicalNote);

        log.info(
                "Created clinical note '{}' for encounter '{}' by actor '{}' (corrId '{}')",
                saved.getId(), requestDto.getEncounterId(), actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ClinicalNoteResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ClinicalNote clinicalNote = getById(id);

        log.info(
                "Retrieved clinical note '{}' (corrId '{}')",
                id, corrId);

        return mapToResponse(clinicalNote);
    }

    @Transactional(readOnly = true)
    public List<ClinicalNoteResponseDto> findByEncounterId(UUID encounterId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        if (!encounterRepository.existsById(encounterId)) {
            throw new EntityNotFoundException(
                    "Encounter not found: " + encounterId);
        }

        List<ClinicalNoteResponseDto> notes =
                clinicalNoteRepository.findByEncounter_Id(encounterId).stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());

        log.info(
                "Retrieved '{}' clinical notes for encounter '{}' (corrId '{}')",
                notes.size(), encounterId, corrId);

        return notes;
    }

    public ClinicalNoteResponseDto update(
            UUID id,
            ClinicalNoteRequestDto requestDto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ClinicalNote clinicalNote = getById(id);

        Encounter encounter = encounterRepository.findById(requestDto.getEncounterId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Encounter not found: " + requestDto.getEncounterId()));

        clinicalNote.setEncounter(encounter);
        clinicalNote.setNoteType(requestDto.getNoteType());
        clinicalNote.setTitle(requestDto.getTitle());
        clinicalNote.setNoteContent(requestDto.getNoteContent());
        clinicalNote.setAuthoredByUserId(requestDto.getAuthoredByUserId());
        if (requestDto.getAuthoredAt() != null) {
            clinicalNote.setAuthoredAt(requestDto.getAuthoredAt());
        }
        clinicalNote.setUpdatedBy(actorId);

        ClinicalNote saved = clinicalNoteRepository.save(clinicalNote);

        log.info(
                "Updated clinical note '{}' by actor '{}' (corrId '{}')",
                id, actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClinicalNoteResponseDto> findByPatientId(UUID patientId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        // 1. Find all appointment IDs belonging to this patient
        List<UUID> appointmentIds = appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(Appointment::getId)
                .collect(Collectors.toList());

        if (appointmentIds.isEmpty()) {
            return List.of();
        }

        // 2. Find encounters linked to those appointments
        List<UUID> encounterIds = encounterRepository.findByAppointmentIdIn(appointmentIds)
                .stream()
                .map(Encounter::getId)
                .collect(Collectors.toList());

        if (encounterIds.isEmpty()) {
            return List.of();
        }

        // 3. Fetch all clinical notes for those encounters
        List<ClinicalNoteResponseDto> notes =
                clinicalNoteRepository.findByEncounter_IdIn(encounterIds).stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());

        log.info(
                "Retrieved '{}' clinical notes for patient '{}' (corrId '{}')",
                notes.size(), patientId, corrId);

        return notes;
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ClinicalNote clinicalNote = getById(id);

        clinicalNoteRepository.delete(clinicalNote);

        log.info(
                "Deleted clinical note '{}' by actor '{}' (corrId '{}')",
                id, actorId, corrId);
    }

    private ClinicalNote getById(UUID id) {
        return clinicalNoteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Clinical note not found: " + id));
    }
}