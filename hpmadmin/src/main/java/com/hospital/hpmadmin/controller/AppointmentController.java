package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.AppointmentRequestDto;
import com.hospital.hpmadmin.dto.AppointmentResponseDto;
import com.hospital.hpmadmin.service.AppointmentService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponseDto createAppointment(
            @Valid @RequestBody AppointmentRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return appointmentService.create(requestDto, actorId);
    }

    @GetMapping
    public List<AppointmentResponseDto> getAllAppointments() {
        return appointmentService.findAll();
    }

    @GetMapping("/{id}")
    public AppointmentResponseDto getAppointmentById(@PathVariable UUID id) {
        return appointmentService.findById(id);
    }

    @GetMapping("/patients/{patientId}")
    public List<AppointmentResponseDto> getAppointmentsByPatient(@PathVariable UUID patientId) {
        return appointmentService.findByPatientId(patientId);
    }

    @PutMapping("/{id}")
    public AppointmentResponseDto updateAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody AppointmentRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return appointmentService.update(id, requestDto, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAppointment(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        appointmentService.delete(id, actorId);
    }
}