package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.ProcedureStatus;
import com.hospital.hpmadmin.model.ProcedureType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "procedures")
@Getter
@Setter
public class Procedure extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "encounter_id", nullable = false)
    private Encounter encounter;

    @Enumerated(EnumType.STRING)
    @Column(name = "procedure_type", nullable = false, length = 50)
    private ProcedureType procedureType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProcedureStatus status; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "performed_at")
    private ZonedDateTime performedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}