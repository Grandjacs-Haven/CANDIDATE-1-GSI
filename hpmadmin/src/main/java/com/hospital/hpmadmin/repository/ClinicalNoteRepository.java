package com.hospital.hpmadmin.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import com.hospital.hpmadmin.entity.ClinicalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClinicalNoteRepository extends JpaRepository<ClinicalNote, UUID> {

    @Query("SELECT c FROM ClinicalNote c WHERE c.encounter.id = :encounterId")
    List<ClinicalNote> findByEncounter_Id(@Param("encounterId") UUID encounterId);

    @Query("SELECT c FROM ClinicalNote c WHERE c.encounter.id IN :encounterIds")
    List<ClinicalNote> findByEncounter_IdIn(@Param("encounterIds") Collection<UUID> encounterIds);
}