package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Procedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProcedureRepository extends JpaRepository<Procedure, UUID> {
    List<Procedure> findByEncounter_Id(UUID encounterId);
}