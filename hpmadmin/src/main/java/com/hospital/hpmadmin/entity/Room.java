package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.RoomStatus;
import com.hospital.hpmadmin.model.RoomType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "rooms",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_room_number_per_ward",
                        columnNames = {"ward_id", "room_number"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_room_ward",
                        columnList = "ward_id"
                )
        }
)
@Getter
@Setter
public class Room extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @Column(name = "room_number", nullable = false, length = 30)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false, length = 40)
    private RoomType roomType;

    @Min(1)
    @Column(nullable = false)
    private Integer capacity = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(columnDefinition = "TEXT")
    private String description;
}