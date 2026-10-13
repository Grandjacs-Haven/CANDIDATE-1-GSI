package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.BedStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "beds",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_bed_number_per_room",
                        columnNames = {"room_id", "bed_number"}
                )
        },
        indexes = {
                @Index(name = "idx_bed_room", columnList = "room_id")
        }
)
@Getter
@Setter
public class Bed extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "bed_number", nullable = false, length = 30)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "operational_status", nullable = false, length = 30)
    private BedStatus bedStatus;

    @Column(columnDefinition = "TEXT")
    private String description;
}