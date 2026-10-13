package com.hospital.hpmadmin.entity;


import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.DeathRecordSource;
import com.hospital.hpmadmin.model.DeathVerificationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "death_records")
public class DeathRecord extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "patient_id",
            nullable = false,
            unique = true
    )
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeathRecordSource source;

    @Column(length = 150)
    private String sourceOrganization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeathVerificationStatus verificationStatus;

    private LocalDateTime dateTimeOfDeath;

    @Column(length = 255)
    private String placeOfDeath;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private JsonNode data;

}
