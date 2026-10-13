package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.EncounterLocation;
import com.hospital.hpmadmin.model.EncounterLocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EncounterLocationRepository
        extends JpaRepository<EncounterLocation, UUID> {

    List<EncounterLocation> findByEncounter_IdOrderByPeriodStartAsc(
            UUID encounterId);

    boolean existsByWardId(UUID wardId);

    boolean existsByRoomId(UUID roomId);

    boolean existsByBedId(UUID bedId);

    boolean existsByEncounter_IdAndStatus(
            UUID encounterId,
            EncounterLocationStatus status);

    boolean existsByEncounter_IdAndStatusAndIdNot(
            UUID encounterId,
            EncounterLocationStatus status,
            UUID excludedLocationId);

    boolean existsByBedIdAndStatus(
            UUID bedId,
            EncounterLocationStatus status);

    boolean existsByBedIdAndStatusAndIdNot(
            UUID bedId,
            EncounterLocationStatus status,
            UUID excludedLocationId);
}