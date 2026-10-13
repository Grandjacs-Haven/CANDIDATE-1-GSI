package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.ObservationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "observations")
@Getter
@Setter
public class Observation extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "encounter_id", nullable = false)
    private Encounter encounter;

    @Enumerated(EnumType.STRING)
    @Column(name = "observation_type", nullable = false, length = 50)
    private ObservationType observationType; // e.g., HEART_RATE

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName; // e.g., "Heart Rate"

    @Column(name = "numeric_value", precision = 12, scale = 4, nullable = false)
    private BigDecimal numericValue; // e.g., 78.0000

    @Column(name = "unit", nullable = false, length = 20)
    private String unit; // e.g., "bpm"

    @Column(name = "effective_at", nullable = false)
    private LocalDateTime effectiveAt;
}