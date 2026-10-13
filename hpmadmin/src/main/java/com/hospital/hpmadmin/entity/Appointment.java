package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.AppointmentStatus;
import com.hospital.hpmadmin.model.AppointmentType;
import com.hospital.hpmadmin.model.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
public class Appointment extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "doctor_id")
    private UUID doctorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_type", nullable = false, length = 30)
    private AppointmentType appointmentType; // SCHEDULED, WALK_IN, EMERGENCY, FOLLOW_UP

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AppointmentStatus status;

    private ZonedDateTime scheduledStartTime;
    private ZonedDateTime actualArrivalTime;
}