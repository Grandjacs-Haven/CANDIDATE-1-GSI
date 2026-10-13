package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.EncounterLocationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "encounter_locations",
        indexes = {
                @Index(
                        name = "idx_encounter_location_encounter",
                        columnList = "encounter_id"
                ),
                @Index(
                        name = "idx_encounter_location_ward",
                        columnList = "ward_id"
                ),
                @Index(
                        name = "idx_encounter_location_room",
                        columnList = "room_id"
                ),
                @Index(
                        name = "idx_encounter_location_bed",
                        columnList = "bed_id"
                )
        }
)
@Getter
@Setter
public class EncounterLocation extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "encounter_id", nullable = false)
    private Encounter encounter;

    @Column(name = "ward_id", nullable = false)
    private UUID wardId;

    @Column(name = "room_id")
    private UUID roomId;

    @Column(name = "bed_id")
    private UUID bedId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EncounterLocationStatus status =
            EncounterLocationStatus.ACTIVE;

    @Column(name = "period_start", nullable = false)
    private LocalDateTime periodStart;

    @Column(name = "period_end")
    private LocalDateTime periodEnd;
}