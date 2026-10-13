package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.AppointmentRequestDto;
import com.hospital.hpmadmin.dto.AppointmentResponseDto;
import com.hospital.hpmadmin.entity.Appointment;
import com.hospital.hpmadmin.model.AppointmentStatus;
import com.hospital.hpmadmin.repository.AppointmentRepository;
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
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentResponseDto mapToResponse(Appointment appointment) {
        return AppointmentResponseDto.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .appointmentType(appointment.getAppointmentType())
                .status(appointment.getStatus())
                .scheduledStartTime(appointment.getScheduledStartTime())
                .actualArrivalTime(appointment.getActualArrivalTime())
                .build();
    }

    public AppointmentResponseDto create(AppointmentRequestDto requestDto, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Creating new appointment for patient '{}' by actor '{}' (corrId '{}')", requestDto.getPatientId(), actorId, corrId);

        Appointment appointment = new Appointment();
        appointment.setPatientId(requestDto.getPatientId());
        appointment.setDoctorId(requestDto.getDoctorId());
        appointment.setAppointmentType(requestDto.getAppointmentType());
        appointment.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : AppointmentStatus.SCHEDULED);
        appointment.setScheduledStartTime(requestDto.getScheduledStartTime());
        appointment.setActualArrivalTime(requestDto.getActualArrivalTime());

        // Audit fields tracking
        appointment.setCreatedBy(actorId);
        appointment.setUpdatedBy(actorId);

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Successfully created appointment '{}' by actor '{}' (corrId '{}')", saved.getId(), actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> findAll() {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching all system appointments (corrId '{}')", corrId);

        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching appointment by id: '{}' (corrId '{}')", id, corrId);

        Appointment appointment = getAppointmentEntity(id);
        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> findByPatientId(UUID patientId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching appointments for patient '{}' (corrId '{}')", patientId, corrId);

        return appointmentRepository.findByPatientIdOrderByScheduledStartTimeDesc(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponseDto update(UUID id, AppointmentRequestDto requestDto, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Updating appointment '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Appointment appointment = getAppointmentEntity(id);

        if (requestDto.getPatientId() != null) {
            appointment.setPatientId(requestDto.getPatientId());
        }
        if (requestDto.getDoctorId() != null) {
            appointment.setDoctorId(requestDto.getDoctorId());
        }
        if (requestDto.getAppointmentType() != null) {
            appointment.setAppointmentType(requestDto.getAppointmentType());
        }
        if (requestDto.getStatus() != null) {
            appointment.setStatus(requestDto.getStatus());
        }
        if (requestDto.getScheduledStartTime() != null) {
            appointment.setScheduledStartTime(requestDto.getScheduledStartTime());
        }
        if (requestDto.getActualArrivalTime() != null) {
            appointment.setActualArrivalTime(requestDto.getActualArrivalTime());
        }

        // Update tracking field
        appointment.setUpdatedBy(actorId);

        Appointment updated = appointmentRepository.save(appointment);
        log.info("Successfully updated appointment '{}' by actor '{}' (corrId '{}')", updated.getId(), actorId, corrId);

        return mapToResponse(updated);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Deleting appointment '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Appointment appointment = getAppointmentEntity(id);
        appointmentRepository.delete(appointment);

        log.info("Successfully deleted appointment '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);
    }

    private Appointment getAppointmentEntity(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + id));
    }
}