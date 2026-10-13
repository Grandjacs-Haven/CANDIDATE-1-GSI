package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.AppointmentStatus;
import com.hospital.hpmadmin.model.AppointmentType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class AppointmentRequestDto {

    @NotNull(message = "Patient ID is required.")
    private UUID patientId;

    private UUID doctorId;

    @NotNull(message = "Appointment type is required.")
    private AppointmentType appointmentType;

    private AppointmentStatus status;

    @NotNull(message = "Scheduled start time is required.")
    private ZonedDateTime scheduledStartTime;

    private ZonedDateTime actualArrivalTime;
}