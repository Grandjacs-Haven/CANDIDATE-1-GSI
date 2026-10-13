package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.AppointmentStatus;
import com.hospital.hpmadmin.model.AppointmentType;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class AppointmentResponseDto {
    private UUID id;
    private UUID patientId;
    private UUID doctorId;
    private AppointmentType appointmentType;
    private AppointmentStatus status;
    private ZonedDateTime scheduledStartTime;
    private ZonedDateTime actualArrivalTime;
}