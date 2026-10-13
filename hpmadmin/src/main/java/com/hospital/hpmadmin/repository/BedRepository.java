package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BedRepository extends JpaRepository<Bed, UUID> {

    List<Bed> findByRoom_IdOrderByBedNumberAsc(UUID roomId);

    boolean existsByRoom_Id(UUID roomId);

    boolean existsByRoom_IdAndBedNumberIgnoreCase(
            UUID roomId, String bedNumber);

    boolean existsByRoom_IdAndBedNumberIgnoreCaseAndIdNot(
            UUID roomId, String bedNumber, UUID id);
}