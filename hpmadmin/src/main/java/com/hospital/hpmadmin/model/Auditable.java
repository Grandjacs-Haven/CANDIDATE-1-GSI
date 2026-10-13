package com.hospital.hpmadmin.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


import java.time.ZonedDateTime;
import java.util.UUID;


@Data // Or @Getter/@Setter
@NoArgsConstructor
@MappedSuperclass
@SuperBuilder
public abstract class Auditable {

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    private UUID createdBy;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    private UUID updatedBy;

    @PrePersist
    private void onCreate() {
        this.createdAt = ZonedDateTime.now();
        this.updatedAt = ZonedDateTime.now();
    }
}
