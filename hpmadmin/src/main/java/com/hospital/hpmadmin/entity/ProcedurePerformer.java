package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.ProcedurePerformerRole;
import com.hospital.hpmadmin.entity.Procedure;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


import java.util.UUID;

@Entity
@Table(
        name = "procedure_performers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_procedure_performer",
                        columnNames = {"procedure_id", "practitioner_id"}
                )
        }
)
@Getter
@Setter
public class ProcedurePerformer extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "procedure_id", nullable = false)
    private Procedure procedure;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "practitioner_id", nullable = false)
    private Practitioner practitioner;

    @Enumerated(EnumType.STRING)
    @Column(name = "performer_role", nullable = false, length = 40)
    private ProcedurePerformerRole performerRole;
}