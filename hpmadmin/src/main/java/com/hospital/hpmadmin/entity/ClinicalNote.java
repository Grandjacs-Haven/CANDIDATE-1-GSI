package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "clinical_notes")
@Getter
@Setter
public class ClinicalNote extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "encounter_id", nullable = false)
    private Encounter encounter;

    @Column(name = "note_type", nullable = false)
    private String noteType;

    @Column(name = "title")
    private String title;

    @Column(name = "note_content", nullable = false, columnDefinition = "TEXT")
    private String noteContent;

    @Column(name = "authored_by_user_id", nullable = false)
    private UUID authoredByUserId;

    @Column(name = "authored_at", nullable = false)
    private ZonedDateTime authoredAt;
}