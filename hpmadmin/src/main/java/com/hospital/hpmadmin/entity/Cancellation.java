package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.CancellationReason;
import com.hospital.hpmadmin.model.CancellationTargetType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "cancellations")
@Getter
@Setter
public class Cancellation extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 40)
    private CancellationTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false, length = 30)
//    private CancellationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private CancellationReason reason;

    @Column(columnDefinition = "TEXT")
    private String reasonDetails;

    @Column(name = "requested_by_user_id", nullable = false)
    private UUID requestedByUserId;

    @Column(name = "requested_at", nullable = false)
    private ZonedDateTime requestedAt;

    @Column(name = "approved_by_user_id")
    private UUID approvedByUserId;

    private ZonedDateTime approvedAt;

    @Column(name = "cancelled_by_user_id")
    private UUID cancelledByUserId;

    private ZonedDateTime cancelledAt;

    @Column(name = "reinstated_by_user_id")
    private UUID reinstatedByUserId;

    private ZonedDateTime reinstatedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}