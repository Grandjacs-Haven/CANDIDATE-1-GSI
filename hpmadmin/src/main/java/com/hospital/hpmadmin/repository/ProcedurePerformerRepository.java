package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.ProcedurePerformer;
import com.hospital.hpmadmin.model.ProcedurePerformerRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProcedurePerformerRepository
        extends JpaRepository<ProcedurePerformer, UUID> {

    List<ProcedurePerformer> findByProcedure_Id(UUID procedureId);

    List<ProcedurePerformer> findByPractitioner_Id(UUID practitionerId);

    Optional<ProcedurePerformer> findByProcedure_IdAndPractitioner_Id(
            UUID procedureId,
            UUID practitionerId
    );

    boolean existsByProcedure_IdAndPractitioner_Id(
            UUID procedureId,
            UUID practitionerId
    );

    List<ProcedurePerformer> findByProcedure_IdAndPerformerRole(
            UUID procedureId,
            ProcedurePerformerRole performerRole
    );
}