package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WardRepository extends JpaRepository<Ward, UUID> {
    // Checks if a ward code already exists (case-insensitive) during creation
    boolean existsByCodeIgnoreCase(String code);

    // Checks if another ward (excluding current ID) uses this code during updates
    boolean existsByCodeIgnoreCaseAndIdNot(String code, UUID id);
}
