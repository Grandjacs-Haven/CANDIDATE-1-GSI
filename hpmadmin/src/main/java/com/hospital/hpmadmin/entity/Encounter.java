package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.EncounterClass;
import com.hospital.hpmadmin.model.EncounterPriority;

import com.hospital.hpmadmin.model.EncounterStatus;
import com.hospital.hpmadmin.model.EncounterType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "encounters",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_encounter_number",
                        columnNames = "encounter_number"
                )
        },
        indexes = {
                @Index(
                        name = "idx_encounter_appointment",
                        columnList = "appointment_id"
                ),
                @Index(
                        name = "idx_encounter_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
public class Encounter extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "encounter_number", nullable = false, length = 50)
    private String encounterNumber;

    /**
     * Every encounter must reference an appointment.
     * Walk-in and emergency visits also receive appointments.
     */
    @Column(name = "appointment_id", nullable = false)
    private UUID appointmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EncounterStatus status ;

    /**
     * Broad care setting.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "encounter_class", nullable = false, length = 30)
    private EncounterClass encounterClass;

    /**
     * Specific purpose of the visit.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "encounter_type", length = 50)
    private EncounterType encounterType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EncounterPriority priority;

//    /**
//     * Organization responsible for the encounter.
//     */
//    @Column(name = "service_provider_organization_id")
//    private UUID serviceProviderOrganizationId;
//
//    /**
//     * Optional link to a parent encounter.
//     */
//    @Column(name = "parent_encounter_id")
//    private UUID parentEncounterId;

    /**
     * Actual start and end of clinical care.
     */
    @Column(name = "actual_start")
    private LocalDateTime actualStart;

    @Column(name = "actual_end")
    private LocalDateTime actualEnd;
}