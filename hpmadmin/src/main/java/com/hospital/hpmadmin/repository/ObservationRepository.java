package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Observation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ObservationRepository extends JpaRepository<Observation, UUID> {
    List<Observation> findByEncounter_Id(UUID encounterId);
}