package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
// ...

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, UUID> {

    @Query("SELECT e FROM Encounter e WHERE e.appointmentId IN :appointmentIds")
    List<Encounter> findByAppointmentIdIn(@Param("appointmentIds") Collection<UUID> appointmentIds);

    boolean existsByEncounterNumberIgnoreCase(String encounterNumber);
}